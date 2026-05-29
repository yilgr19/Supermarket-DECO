// ES: Contrato HTTP lambda-ventas (API Gateway + LocalStack)
// EN: lambda-ventas HTTP contract (API Gateway + LocalStack)

export interface ProductoLambda {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  stock_disponible: number
  estado: string
  codigo_barras?: string
}

export interface VentaItemLambda {
  id: string
  nombre: string
  precio: number
  cantidad: number
}

export interface VentaRequestLambda {
  items: VentaItemLambda[]
  descuento?: number
}

export interface VentaResponseLambda {
  mensaje: string
  idVenta: string
  items: VentaItemLambda[]
  subtotal: number
  descuento: number
  iva: number
  total: number
}

export interface ApiErrorLambda {
  error: string
}
