import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";

const waitlistSchema = z.object({
  email: z.string().email("Enter a valid email"),
  whatsapp: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, { message: "You must agree to continue" }),
});

type WaitlistData = z.infer<typeof waitlistSchema>;

export function WaitlistForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<WaitlistData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: "", whatsapp: "", consent: false },
  });

  const mutation = useMutation({
    mutationFn: async (data: WaitlistData) => {
      const { consent, ...payload } = data;
      await apiRequest("POST", "/api/leads", payload);
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message.includes("409") ? "You're already on the list." : "Something went wrong. Try again.",
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6" data-testid="waitlist-success">
        <div className="w-10 h-10 rounded-full border border-foreground flex items-center justify-center">
          <Check className="w-5 h-5" />
        </div>
        <p className="text-sm tracking-[0.15em] uppercase">You're on the list</p>
        <p className="text-xs text-muted-foreground">We'll notify you before the drop.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="w-full max-w-md mx-auto flex flex-col gap-3"
        data-testid="waitlist-form"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="bg-transparent border-foreground/20 text-sm tracking-[0.1em] placeholder:text-muted-foreground/50 placeholder:tracking-[0.15em] h-12 rounded-none"
                  data-testid="input-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="WHATSAPP (OPTIONAL)"
                  className="bg-transparent border-foreground/20 text-sm tracking-[0.1em] placeholder:text-muted-foreground/50 placeholder:tracking-[0.15em] h-12 rounded-none"
                  data-testid="input-whatsapp"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex items-start gap-2 space-y-0 py-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 rounded-none"
                  data-testid="checkbox-consent"
                />
              </FormControl>
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] text-muted-foreground leading-snug cursor-pointer" onClick={() => field.onChange(!field.value)}>
                  I agree to receive marketing communications from DISTRICT21. You can unsubscribe at any time.
                </label>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-12 rounded-none tracking-[0.2em] text-sm font-medium"
          data-testid="button-join-waitlist"
        >
          {mutation.isPending ? (
            "JOINING..."
          ) : (
            <span className="flex items-center gap-2">
              JOIN THE WAITLIST <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
}
