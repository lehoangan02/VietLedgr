import Papa from 'papaparse'

export interface ProductCsvRow {
   name: string
   retail_category: string
   sku: string
   description: string
   category_id: string
   store_id: string
   warehouse_id: string
   quantity: number
   price: number
   tax_type?: string
   discount_type?: string
   discount_value?: number
   quantity_alert?: number
}

export async function importProductsFromCsv(
   file: File,
   onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
   return new Promise((resolve, reject) => {
      Papa.parse<ProductCsvRow>(file, {
         header: true,
         skipEmptyLines: true,
         complete: async (results: Papa.ParseResult<ProductCsvRow>) => {
            const rows = results.data
            let success = 0
            let failed = 0
            const errors: string[] = []
            for (let i = 0; i < rows.length; i++) {
               const row = rows[i]
               try {
                  // 1. Add product
                  const productPayload = {
                     name: row.name,
                     retail_category: row.retail_category,
                     sku: row.sku,
                     description: row.description,
                     category_id: row.category_id,
                     store_id: row.store_id,
                     // image_base64: not handled in CSV import
                  }
                  const productRes = await fetch('http://localhost:8000/api/products/', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(productPayload)
                  })
                  if (!productRes.ok) throw new Error('Failed to add product')
                  const productData = await productRes.json()
                  const productId = productData.product_id

                  // 2. Add batch
                  const batchPayload = {
                     product_id: productId,
                     warehouse_id: row.warehouse_id,
                     stock: row.quantity || 0,
                     cost: row.price || 0,
                     sale_price: row.price || 0,
                     import_date: new Date().toISOString(),
                     expire_date: null,
                     supplier_name: 'Group 1',
                  }
                  const batchRes = await fetch('http://localhost:8000/api/batches/', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(batchPayload)
                  })
                  if (!batchRes.ok) throw new Error('Failed to add batch')
                  success++
               } catch (err: any) {
                  failed++
                  errors.push(`Row ${i + 2}: ${err.message}`)
               }
               if (onProgress) onProgress(i + 1, rows.length)
            }
            resolve({ success, failed, errors })
         },
         error: (err: Papa.ParseError) => reject(err)
      })
   })
}
