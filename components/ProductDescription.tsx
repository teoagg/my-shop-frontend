type TextNode = {
  text?: string
  bold?: boolean
  italic?: boolean
}

type BlockNode = {
  type?: string
  children?: TextNode[]
}

function renderInline(children?: TextNode[]) {
  if (!Array.isArray(children)) return null

  return children.map((child, index) => {
    let content: React.ReactNode = child.text || ''

    if (child.bold) content = <strong>{content}</strong>
    if (child.italic) content = <em>{content}</em>

    return <span key={`${child.text || 'text'}-${index}`}>{content}</span>
  })
}

export default function ProductDescription({
  description,
}: {
  description: unknown
}) {
  if (!Array.isArray(description) || description.length === 0) {
    return (
      <p className="muted">
        Δεν υπάρχει αναλυτική περιγραφή για αυτό το προϊόν.
      </p>
    )
  }

  return (
    <div className="space-y-3 text-sm leading-7 text-[var(--muted)]">
      {(description as BlockNode[]).map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h2
              key={index}
              className="text-xl font-bold text-[var(--foreground)]"
            >
              {renderInline(block.children)}
            </h2>
          )
        }

        return <p key={index}>{renderInline(block.children)}</p>
      })}
    </div>
  )
}
