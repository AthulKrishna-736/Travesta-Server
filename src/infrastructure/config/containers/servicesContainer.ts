import { container } from "tsyringe";
import { TOKENS } from "../../../constants/token";

import { AuthService } from "../../services/authService";
import { MailService } from "../../services/mailService";
import { RedisService } from "../../services/redisService"
import { AwsS3Service } from "../../services/awsS3Service";
import { SocketService } from "../../services/socketService";
import { StripeService } from "../../services/stripeService";

import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { IMailService } from "../../../domain/interfaces/services/mailService.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";

import { ISocketService } from "../../../domain/interfaces/model/admin.interface";
import { IStripeService } from "../../../domain/interfaces/services/stripeService.interface";


container.register<IAuthService>(TOKENS.AuthService, {
    useClass: AuthService,
});

container.register<IMailService>(TOKENS.MailService, {
    useClass: MailService,
});

container.register<IRedisService>(TOKENS.RedisService, {
    useClass: RedisService,
})

container.register<IAwsS3Service>(TOKENS.AwsS3Service, {
    useClass: AwsS3Service,
})

container.register<ISocketService>(TOKENS.SocketService, {
    useClass: SocketService,
})

container.register<IStripeService>(TOKENS.StripeService, {
    useClass: StripeService,
})
