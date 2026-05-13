// ES: Validación local de formulario de catálogo
// EN: Local catalog form validation

import type { CatalogProductInput } from '../types/catalogProduct.types'

const REQUIRED: (keyof CatalogProductInput)[] = [
  'nombre',
  'descripcion',
  'subcategoria',
  'precio',
  'precioxcantidad',
  'estado',
]

export function validateCatalogProductInput(
  values: CatalogProductInput
): Partial<Record<keyof CatalogProductInput, string>> {
  const errors: Partial<Record<keyof CatalogProductInput, string>> = {}

  for (const field of REQUIRED) {
    const value = values[field]
    if (value === undefined || value === null || String(value).trim() === '') {
      errors[field] = 'Este campo es obligatorio'
    }
  }

  if (values.precio !== undefined && values.precio <= 0) {
    errors.precio = 'Debe ser un número mayor que 0'
  }
  if (values.precioxcantidad !== undefined && values.precioxcantidad <= 0) {
    errors.precioxcantidad = 'Debe ser un número mayor que 0'
  }
  if (values.estado && values.estado !== 'activo' && values.estado !== 'inactivo') {
    errors.estado = 'Elige activo o inactivo'
  }
  if (values.availableStock !== undefined && values.availableStock < 0) {
    errors.availableStock = 'No puede ser negativo'
  }

  return errors
}

export function hasCatalogProductErrors(
  errors: Partial<Record<keyof CatalogProductInput, string>>
): boolean {
  return Object.keys(errors).length > 0
}
