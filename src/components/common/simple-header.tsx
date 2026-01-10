import Title from "./title";

export default function SimpleHeader() {
  return (
    <header className="flex items-center h-16 border-b w-full justify-between">
      <div className="mx-4">
        <Title />
      </div>
    </header>
  );
}
