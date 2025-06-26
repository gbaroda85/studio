
"use client"

import { useState } from "react"
import { format, differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths, differenceInCalendarDays } from "date-fns"
import { Calendar as CalendarIcon, Calculator, Gift, CalendarHeart } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "./ui/separator"

type AgeDetails = {
  years: number;
  months: number;
  days: number;
  dayOfWeek: string;
  daysToNextBirthday: number;
}

export default function AgeCalculator() {
  const [dateOfBirth, setDateOfBirth] = useState<Date>()
  const [age, setAge] = useState<AgeDetails | null>(null)
  const { toast } = useToast()

  const handleCalculateAge = () => {
    if (!dateOfBirth) {
      toast({
        variant: "destructive",
        title: "No Date Selected",
        description: "Please select your date of birth.",
      })
      return
    }

    const now = new Date()
    if (dateOfBirth > now) {
      toast({
        variant: "destructive",
        title: "Invalid Date",
        description: "Date of birth cannot be in the future.",
      })
      return
    }

    const years = differenceInYears(now, dateOfBirth)
    const pastDateWithYears = addYears(dateOfBirth, years)
    const months = differenceInMonths(now, pastDateWithYears)
    const pastDateWithMonths = addMonths(pastDateWithYears, months)
    const days = differenceInDays(now, pastDateWithMonths)
    
    // Calculate next birthday
    let nextBirthday = new Date(now.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate());
    if (now > nextBirthday) {
      nextBirthday = new Date(now.getFullYear() + 1, dateOfBirth.getMonth(), dateOfBirth.getDate());
    }
    const daysToNextBirthday = differenceInCalendarDays(nextBirthday, now);
    
    const dayOfWeek = format(dateOfBirth, "EEEE");

    setAge({ years, months, days, dayOfWeek, daysToNextBirthday })
  }
  
  const handleReset = () => {
    setDateOfBirth(undefined);
    setAge(null);
  }

  return (
    <Card className="w-full max-w-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Age Calculator</CardTitle>
        <CardDescription>Discover your age and more.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateOfBirth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-2 border-primary/20 shadow-xl rounded-2xl">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={setDateOfBirth}
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={new Date().getFullYear()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {age !== null && (
           <div className="pt-4 space-y-6">
                <div className="text-center">
                    <p className="text-muted-foreground">You are</p>
                    <div className="flex justify-center items-baseline gap-4 my-2">
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-bold text-primary">{age.years}</span>
                            <span className="text-sm text-muted-foreground">Years</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-bold text-primary">{age.months}</span>
                            <span className="text-sm text-muted-foreground">Months</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-bold text-primary">{age.days}</span>
                            <span className="text-sm text-muted-foreground">Days</span>
                        </div>
                    </div>
                     <p className="text-muted-foreground">old</p>
                </div>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 text-primary">
                           <Gift className="h-5 w-5" />
                           <span className="font-semibold">Next Birthday:</span>
                           <span className="font-bold">{age.daysToNextBirthday} days</span>
                        </div>
                    </div>
                     <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarHeart className="h-5 w-5" />
                            <span className="font-medium">Born on a:</span>
                            <span className="font-semibold text-foreground">{age.dayOfWeek}</span>
                        </div>
                    </div>
                </div>
           </div>
        )}

      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleCalculateAge} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Calculator className="mr-2" />
          Calculate Age
        </Button>
        {age !== null && <Button variant="ghost" onClick={handleReset} className="w-full">Calculate another</Button>}
      </CardFooter>
    </Card>
  )
}
