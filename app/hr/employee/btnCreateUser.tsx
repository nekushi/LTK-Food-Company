"use client";

export default function Button({ children }: { children: React.ReactNode }) {
  const onHandleClick = () => {
    console.log("hello world");
  };

  return (
    <button onClick={onHandleClick} className="border px-2 py-1 rounded">
      {children}
    </button>
  );
}
