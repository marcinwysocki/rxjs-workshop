/*
    Przyjmijmy, że mamy integrować się z usługą, z którą komunikacja przebiega asynchronicznie
    wg określonego protokołu. Mamy dostępnego klienta (bibliotekę), który obsługuje ten protokół
    i wystawia nam klasyczne, callbackowe API zwracające dane w postaci JSowych obiektów na określone
    zdarzenia.

    Przykład: komunikacja z backendem XMPP poprzez bibliotekę Stanza.io

    Co wiemy:
        - mamy listę obsługiwanych eventów
        - wiemy, że po połaczeniu (Connected), musimy się jeszcze zalogować i dopiero
          potem (SessionStarted) możemy działać
        - wiemy, że po żądaniu zamknięcia połączenia dostaniemy potwierdzenie (event Disconnected)
        - znamy format zwrotek z eventami (RawEvent) i to, że po wysłaniu zdarzenia dostaniemy
        potwierdzenie w takim samym formacie
        - dostajemy configa z naszym własnym id

    Czego chcemy:
        1. publikować własne zdarzenia za pomocą klienta
        2. reagować na eventy niosące ważne dla nas informacje (wiadomości z XMPP, zdarzenia z szyny etc.),
        ale tylko te od innych użytkowników
        3. znać aktualny stan połączenia i obsługiwać jakoś chociażby rozłączenie,
          w zależności od tego, czy nastąpiło z powodu błędu, czy nie

    Zadanie brzmi: napisz serwis, który opakuje rzeczoną bibliotekę i wystawi opisane wyżej funkcjonalności
    w postaci strumieni.

    UWAGA: część testów jest początkowo pominięta, żeby nie śmieciły w konsoli. Żeby je uaktywnić zamień 'xdescribe' na 'describe'.
*/

import { Observable } from 'rxjs';
const NodeEventEmitter = require('events');

export interface IServiceConfig {
    ownId: number;
}

export enum ConnectionStateType {
    Connected = 'connected',
    Disconnected = 'disconnected',
    Connecting = 'connecting',
}

export type ConnectionState = {
    type: ConnectionStateType;
    error?: Error;
};

export type RawEvent = {
    name: string;
    senderId: number;
    data: any;
};

export type IncomingEvent = {
    name: string;
    payload: any;
};

export enum EventEmitterEvents {
    Connected = 'connected',
    Disconnected = 'disconnected',
    SessionStarted = 'session:started',
    IncomingEvent = 'incoming:event',
    PublishError = 'publish:error',
    AuthFailed = 'auth:failed',
    ConnectionTimeout = 'connection:timeout',
}

export type EventEmitterFactory = (token: string) => IEventEmitterClient;
export interface IEventEmitterClient {
    on(
        event: EventEmitterEvents,
        callback: (event: IncomingEvent) => void,
    ): void;
    off(
        event: EventEmitterEvents,
        callback: (event: IncomingEvent) => void,
    ): void;
    connect(): void;
    disconnect(): void;
    publishEvent(event: IncomingEvent): void;
}

export interface IEventEmitterService {
    connectionStates(): Observable<ConnectionState>;
    events(): Observable<IncomingEvent>;
    connect(): void;
    disconnect(): void;
    publishEvent(event: IncomingEvent): void;
}

/*********************************************************/

class EventEmitterService implements IEventEmitterService {
    constructor(
        private client: IEventEmitterClient,
        private config: IServiceConfig,
    ) {}

    publishEvent(event: IncomingEvent): void {
        throw new Error('Method not implemented.');
    }

    events(): Observable<IncomingEvent> {
        throw new Error('Method not implemented.');
    }

    connect(): void {
        throw new Error('Method not implemented.');
    }

    disconnect(): void {
        throw new Error('Method not implemented.');
    }

    connectionStates(): Observable<ConnectionState> {
        throw new Error('Method not implemented.');
    }
}

describe('EventEmitterService', () => {
    let eventEmitterService: IEventEmitterService;
    let fakeClient: IEventEmitterClient;

    const emitter = new NodeEventEmitter();

    beforeEach(() => {
        fakeClient = {
            connect: jest.fn(() => {
                Promise.resolve().then(() =>
                    emitter.emit(EventEmitterEvents.SessionStarted),
                );
            }),
            disconnect: jest.fn(() => {
                Promise.resolve().then(() =>
                    emitter.emit(EventEmitterEvents.Disconnected),
                );
            }),
            publishEvent: jest.fn(),
            on(event, handler) {
                emitter.on(event, handler);
            },
            off(event, handler) {
                emitter.removeListener(event, handler);
            },
        };

        eventEmitterService = new EventEmitterService(fakeClient, {
            ownId: 12345,
        });
    });

    describe('events', () => {
        it('calls the client to publish an event', () => {
            eventEmitterService.publishEvent({
                name: 'SOME_EVENT',
                payload: { data: 'some data' },
            });

            expect(fakeClient.publishEvent).toHaveBeenCalledWith({
                name: 'SOME_EVENT',
                payload: { data: 'some data' },
            });
        });

        it('formats incoming events', done => {
            expect.assertions(2);

            eventEmitterService
                .events()
                .take(2)
                .toArray()
                .subscribe(([firstEvent, secondEvent]) => {
                    expect(firstEvent).toEqual({
                        name: 'VERY_IMPORTANT_STUFF',
                        payload: { prop: 'data' },
                    } as IncomingEvent);
                    expect(secondEvent).toEqual({
                        name: 'CASUAL_EVENT',
                        payload: 'some other payload',
                    } as IncomingEvent);

                    done();
                });

            emitter.emit(EventEmitterEvents.IncomingEvent, {
                name: 'VERY_IMPORTANT_STUFF',
                data: { prop: 'data' },
                senderId: 4321,
            } as RawEvent);
            emitter.emit(EventEmitterEvents.IncomingEvent, {
                name: 'CASUAL_EVENT',
                data: 'some other payload',
                senderId: 987,
            } as RawEvent);
        });

        it('passes through only the events from other sources (not ACKs)', done => {
            expect.assertions(2);

            eventEmitterService
                .events()
                .take(2)
                .toArray()
                .subscribe(([firstEvent, secondEvent]) => {
                    expect(firstEvent).toEqual({
                        name: 'VERY_IMPORTANT_STUFF',
                        payload: { prop: 'data' },
                    } as IncomingEvent);
                    expect(secondEvent).toEqual({
                        name: 'CASUAL_EVENT',
                        payload: 'some other payload',
                    } as IncomingEvent);

                    done();
                });

            emitter.emit(EventEmitterEvents.IncomingEvent, {
                name: 'VERY_IMPORTANT_STUFF',
                data: { prop: 'data' },
                senderId: 4321,
            } as RawEvent);
            emitter.emit(EventEmitterEvents.IncomingEvent, {
                name: 'ACK',
                data: "I've sent something, now it comes back to me",
                senderId: 12345,
            } as RawEvent);
            emitter.emit(EventEmitterEvents.IncomingEvent, {
                name: 'CASUAL_EVENT',
                data: 'some other payload',
                senderId: 987,
            } as RawEvent);
        });
    });

    xdescribe('connection', () => {
        it('calls the client to establish a connection', () => {
            eventEmitterService.connect();

            expect(fakeClient.connect).toHaveBeenCalled();
        });

        it('calls the client to disconnect', () => {
            eventEmitterService.disconnect();

            expect(fakeClient.disconnect).toHaveBeenCalledWith();
        });

        it("notifies subscribers that it's connecting", done => {
            expect.assertions(2);

            eventEmitterService
                .connectionStates()
                .take(1)
                .subscribe(state => {
                    expect(state.error).toBeUndefined();
                    expect(state.type).toBe(ConnectionStateType.Connecting);

                    done();
                });

            eventEmitterService.connect();
        });

        it('notifies subscribers that the connection has been established (with session)', done => {
            expect.assertions(4);

            eventEmitterService
                .connectionStates()
                .take(2)
                .toArray()
                .subscribe(([firstState, secondState]) => {
                    expect(firstState.error).toBeUndefined();
                    expect(firstState.type).toBe(
                        ConnectionStateType.Connecting,
                    );

                    expect(secondState.error).toBeUndefined();
                    expect(secondState.type).toBe(
                        ConnectionStateType.Connected,
                    );

                    done();
                });

            eventEmitterService.connect();
        });

        it('notifies subscribers about a valid disconnection event', done => {
            expect.assertions(2);

            eventEmitterService
                .connectionStates()
                .take(1)
                .subscribe(state => {
                    expect(state.error).toBeUndefined();
                    expect(state.type).toBe(ConnectionStateType.Disconnected);

                    done();
                });

            eventEmitterService.disconnect();
        });

        it('notifies subscribers about a disconnection with auth error', done => {
            expect.assertions(3);

            eventEmitterService
                .connectionStates()
                .take(1)
                .subscribe(state => {
                    expect(state.error).toBeDefined();
                    expect(state.error).toEqual(
                        new Error('Authorization failed'),
                    );
                    expect(state.type).toBe(ConnectionStateType.Disconnected);

                    done();
                });

            emitter.emit(EventEmitterEvents.AuthFailed);
        });

        it('notifies subscribers about a disconnection with connection timeout', done => {
            expect.assertions(3);

            eventEmitterService
                .connectionStates()
                .take(1)
                .subscribe(state => {
                    expect(state.error).toBeDefined();
                    expect(state.error).toEqual(
                        new Error('Connection timeout'),
                    );
                    expect(state.type).toBe(ConnectionStateType.Disconnected);

                    done();
                });

            emitter.emit(EventEmitterEvents.ConnectionTimeout);
        });

        it('notify subscribers only about the first of the consecutive events in the same category (disconneced with error, connected etc.)', done => {
            expect.assertions(5);

            eventEmitterService
                .connectionStates()
                .take(2)
                .toArray()
                .subscribe(([firstState, secondState]) => {
                    expect(firstState.error).toBeDefined();
                    expect(firstState.error).toEqual(
                        new Error('Connection timeout'),
                    );
                    expect(firstState.type).toBe(
                        ConnectionStateType.Disconnected,
                    );

                    expect(secondState.error).toBeUndefined();
                    expect(secondState.type).toBe(
                        ConnectionStateType.Connected,
                    );

                    done();
                });

            emitter.emit(EventEmitterEvents.ConnectionTimeout);
            emitter.emit(EventEmitterEvents.AuthFailed);
            emitter.emit(EventEmitterEvents.ConnectionTimeout);
            emitter.emit(EventEmitterEvents.AuthFailed);
            emitter.emit(EventEmitterEvents.SessionStarted);
        });
    });
});
