// ES: Selección de adaptadores Spring vs Lambda según .env
// EN: Spring vs Lambda adapter selection from .env

import { isLambdaBackend } from '../../config/api'
import { productApiAdapter } from './productApiAdapter'
import { salesApiAdapter } from './salesApiAdapter'
import { lambdaProductApiAdapter } from './lambdaProductApiAdapter'
import { lambdaSaleApiAdapter } from './lambdaSaleApiAdapter'

export { isLambdaBackend, LAMBDA_UNAVAILABLE_MSG } from '../../config/api'

export const productPort = isLambdaBackend ? lambdaProductApiAdapter : productApiAdapter
export const salePort = isLambdaBackend ? lambdaSaleApiAdapter : salesApiAdapter
