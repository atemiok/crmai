import { Module } from "@nestjs/common";
import { ApiAuthController, AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthHooksService } from "./auth-hooks.service";

@Module({
	controllers: [AuthController, ApiAuthController],
	providers: [AuthService, AuthHooksService],
	exports: [AuthService],
})
export class AuthModule {}
