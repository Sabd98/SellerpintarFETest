import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectTemplate({children,handleCategoryChange, selectedCategory}) {
  return (
    <Select onValueChange={handleCategoryChange} value={selectedCategory}>
      <SelectTrigger className="bg-white backdrop-blur-sm border-blue-300/20 hover:bg-slate-5">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200">
        <SelectItem value="all">All Categories</SelectItem>
        {children}
      </SelectContent>
    </Select>
  );
}
