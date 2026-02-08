import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";
import { Check, Mail, Send } from "lucide-react";
import { useState } from "react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(1, "Message is required"),
});

type ContactData = z.infer<typeof contactSchema>;

export default function Contact() {
  usePageTitle("Contact | DISTRICT21", "Get in touch with DISTRICT21. We'd love to hear from you.");
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactData) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      setSent(true);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-10 w-full max-w-md py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase">
            Get in touch
          </span>
          <h1
            className="font-mono text-3xl sm:text-4xl font-bold tracking-[0.1em]"
            data-testid="text-contact-title"
          >
            CONTACT
          </h1>
          <div className="w-12 h-[1px] bg-foreground/20 mt-2" />
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span className="text-sm tracking-wide" data-testid="text-email">hello@district21.com</span>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6" data-testid="contact-success">
            <div className="w-10 h-10 rounded-full border border-foreground flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm tracking-[0.15em] uppercase">Message sent</p>
            <p className="text-xs text-muted-foreground">We'll get back to you shortly.</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="w-full flex flex-col gap-3"
              data-testid="contact-form"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="YOUR NAME"
                        className="bg-transparent border-foreground/20 text-sm tracking-[0.1em] placeholder:text-muted-foreground/50 placeholder:tracking-[0.15em] h-12 rounded-none"
                        data-testid="input-contact-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        data-testid="input-contact-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="YOUR MESSAGE"
                        rows={4}
                        className="bg-transparent border-foreground/20 text-sm tracking-[0.1em] placeholder:text-muted-foreground/50 placeholder:tracking-[0.15em] rounded-none resize-none"
                        data-testid="input-contact-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="h-12 rounded-none tracking-[0.2em] text-sm font-medium"
                data-testid="button-send-message"
              >
                {mutation.isPending ? (
                  "SENDING..."
                ) : (
                  <span className="flex items-center gap-2">
                    SEND MESSAGE <Send className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
