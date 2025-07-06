import { BaseRoute } from './base.route.js'
import controller from '../controllers/health.controller.js'

export class HealthRoute extends BaseRoute {
  constructor() {
    super()
  }
  protected initRoutes(): void {
    this.router.route('/health').get(controller.healthCheck)
  }
}

export default new HealthRoute().getRouter()
