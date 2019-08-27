import * as EventEmitter from "events";

export class EventHandler extends EventEmitter {

    public on(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    public emit(event: string | symbol, ...args: any[]): boolean {
        return super.emit(event, args);
    }

    public once(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.once(event, listener);
    }

}