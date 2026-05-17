import { Layers } from 'lucide-react'
import { NewModuleForm } from './NewModuleForm'

export default function NewModulePage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" /> New module
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tạo module ở trạng thái DRAFT. Khi xong, submit review và admin sẽ publish.
        </p>
      </header>
      <NewModuleForm />
    </div>
  )
}
