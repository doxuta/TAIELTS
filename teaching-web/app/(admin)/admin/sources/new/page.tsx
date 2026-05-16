import { NewSourceForm } from './NewSourceForm'

export default function NewSourcePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-ink-primary">New source</h1>
        <p className="text-sm text-ink-tertiary">
          Khai báo metadata. Source sẽ ở trạng thái DRAFT cho đến khi được approve.
        </p>
      </header>
      <NewSourceForm />
    </div>
  )
}
