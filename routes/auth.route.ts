import { BaseRoute } from './base.route.js'
import controller from '../controllers/auth.controller.js'
export class AuthRoute extends BaseRoute {
  constructor() {
    super()
  }

  protected initRoutes(): void {
    this.router.route('/register').post(controller.register)
    this.router.route('/login').post(controller.login)
    this.router.route('/verify-otp-email').post(controller.verifyOTPEmail)
    this.router.route('/resend-otp-email').post(controller.resendOTPEmail)
    this.router.route('/change-email').post(controller.changeEmail)
    this.router.route('/change-phone').post(controller.changePhone)
    this.router.route('/change-password').post(controller.changePassword)
    this.router.route('/refresh-token').post(controller.refreshToken)
  }
}

export default new AuthRoute().getRouter()
