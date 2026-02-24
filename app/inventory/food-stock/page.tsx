import { FoodStockList } from "./food-stock-list";
import { getFoodStocks } from "@/dal/inventory/get-food-stocks";

export default async function FoodStockPage() {
  const items = await getFoodStocks();

  return (
    <div className="h-full w-full bg-[var(--ltk-blue-gray)]">
      <FoodStockList items={items} />
    </div>
  );
}
