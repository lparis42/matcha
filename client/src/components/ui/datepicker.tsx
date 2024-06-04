import * as React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
 
export function DatePicker({id, date, setDate}) {
  if (!(date instanceof Date)) {
    console.error('Invalid date object');
    return null;
  }
  return (
        <div className="w-auto p-0" align="start">
          <div className="grid grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-950 rounded-lg">
            <div className="flex flex-col gap-2">
              <Label htmlFor="year" className="text-sm font-medium">
                Year
              </Label>
              <Select id="year" defaultValue={date.getFullYear().toString()} onValueChange={(year) => {setDate(new Date(year, date.getMonth(), date.getDate()));}}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-40">
                    {Array.from({ length: 50 }, (_, i) => date.getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="month" className="text-sm font-medium">
                Month
              </Label>
              <Select id="month" defaultValue={(date.getMonth() + 1).toString()} onValueChange={(month) => {setDate(new Date(date.getFullYear(), month - 1, date.getDate()))}}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-40">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(0, month - 1).toLocaleString("default", {
                          month: "long",
                        })}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="day" className="text-sm font-medium">
                Day
              </Label>
              <Select id="day" defaultValue={date.getDate().toString()} onValueChange={(day) => {setDate(new Date(date.getFullYear(), date.getMonth(), day))}}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-40">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
  )
}
