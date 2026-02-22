import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  console.log(`Fetching data`);

  const { data: dataInReverse, error } = await supabase
    .from("location")
    .select();

  const data = dataInReverse?.reverse();

  console.log(`From get route:`);
  // console.log(data);
  console.log(dataInReverse);

  return NextResponse.json(data);
  // return new Response(JSON.stringify(data));
}
