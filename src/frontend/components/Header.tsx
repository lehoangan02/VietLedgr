export default function Header({
  pageName, 
  description
}: {
  pageName: string,
  description: string,
}) {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{pageName}</h1>
      <p className="text-gray-500 mt-1 font-normal">{description}</p>
    </div>
  )
}