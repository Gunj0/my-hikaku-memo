export default function StepNumber({ number }: { number: number }) {
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
      {number}
    </span>
  );
}
