import { injectable } from "tsyringe";


@injectable()
export class SocketService {
    constructor(
        private io,
    ) { }

    async sendMessage() { }

    async receiveMessage() { }

    async readMessage() { }
}