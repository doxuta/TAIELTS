import { NewModuleForm } from './NewModuleForm'

export default function NewModulePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-ink-primary">New module</h1>
        <p className="text-sm text-ink-tertiary">
          Tạo module ở trạng thái DRAFT. Khi xong, submit review và admin sẽ publish.
        </p>
      </header>
      <NewModuleForm />
    </div>
  )
}
