import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  categories: string[];
  types: string[];
  selectedCategory: string;
  selectedType: string;
  onCategoryChange: (val: string) => void;
  onTypeChange: (val: string) => void;
}

const FilterBar = ({ categories, types, selectedCategory, selectedType, onCategoryChange, onTypeChange }: FilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px] bg-card">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(c => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[180px] bg-card">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {types.map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterBar;
