import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Settings, Users, Lock } from "lucide-react";
import type { DropSettings, Lead } from "@shared/schema";

function AdminLogin({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        onLogin(pw);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <Lock className="w-6 h-6 text-muted-foreground" />
        <h1 className="font-mono text-lg tracking-[0.2em] font-bold">ADMIN</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <Input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            placeholder="PASSWORD"
            className="bg-transparent border-foreground/20 text-sm tracking-[0.1em] placeholder:text-muted-foreground/50 h-12 rounded-none text-center"
            data-testid="input-admin-password"
          />
          {error && <p className="text-xs text-destructive text-center">Invalid password</p>}
          <Button type="submit" className="h-12 rounded-none tracking-[0.2em] text-sm" data-testid="button-admin-login">
            ENTER
          </Button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ adminPw }: { adminPw: string }) {
  const { toast } = useToast();

  const headers = { "x-admin-password": adminPw };

  const { data: settings, isLoading: settingsLoading } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/leads", { headers });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const [dropDate, setDropDate] = useState("");
  const [shopifyUrl, setShopifyUrl] = useState("");

  const updateSettings = useMutation({
    mutationFn: async (data: Partial<{ dropDate: string; isLive: boolean; shopifyUrl: string }>) => {
      const res = await fetch("/api/admin/drop-settings", {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drop-settings"] });
      toast({ title: "Settings updated" });
    },
    onError: () => {
      toast({ title: "Error updating settings", variant: "destructive" });
    },
  });

  const handleExportCSV = async () => {
    const res = await fetch("/api/admin/leads/export", { headers });
    if (!res.ok) {
      toast({ title: "Export failed", variant: "destructive" });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `district21-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border border-foreground/30 border-t-foreground animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-5 h-5" />
          <h1 className="font-mono text-lg tracking-[0.2em] font-bold">ADMIN PANEL</h1>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="font-mono text-sm tracking-[0.2em] mb-6 font-medium">DROP SETTINGS</h2>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-[0.15em] text-muted-foreground">DROP DATE & TIME</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="datetime-local"
                    value={dropDate || (settings?.dropDate ? new Date(settings.dropDate).toISOString().slice(0, 16) : "")}
                    onChange={(e) => setDropDate(e.target.value)}
                    className="bg-transparent border-foreground/20 text-sm h-10 rounded-none flex-1 min-w-[200px]"
                    data-testid="input-drop-date"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none tracking-[0.1em] text-xs"
                    onClick={() => {
                      if (dropDate) updateSettings.mutate({ dropDate });
                    }}
                    disabled={!dropDate || updateSettings.isPending}
                    data-testid="button-save-date"
                  >
                    SET DATE
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-[0.15em] text-muted-foreground">SHOPIFY URL</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    value={shopifyUrl || settings?.shopifyUrl || ""}
                    onChange={(e) => setShopifyUrl(e.target.value)}
                    placeholder="https://shop.district21.com"
                    className="bg-transparent border-foreground/20 text-sm h-10 rounded-none flex-1 min-w-[200px] placeholder:text-muted-foreground/40"
                    data-testid="input-shopify-url"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none tracking-[0.1em] text-xs"
                    onClick={() => {
                      if (shopifyUrl) updateSettings.mutate({ shopifyUrl });
                    }}
                    disabled={!shopifyUrl || updateSettings.isPending}
                    data-testid="button-save-url"
                  >
                    SAVE
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-sm font-medium">Drop Live</p>
                  <p className="text-xs text-muted-foreground">Toggle to make the drop accessible</p>
                </div>
                <Switch
                  checked={settings?.isLive ?? false}
                  onCheckedChange={(checked) => updateSettings.mutate({ isLive: checked })}
                  data-testid="switch-drop-live"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <h2 className="font-mono text-sm tracking-[0.2em] font-medium">LEADS</h2>
                <span className="text-xs text-muted-foreground ml-1">({leads.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none tracking-[0.1em] text-xs"
                onClick={handleExportCSV}
                data-testid="button-export-csv"
              >
                <Download className="w-3 h-3 mr-1" /> EXPORT CSV
              </Button>
            </div>

            {leadsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border border-foreground/30 border-t-foreground animate-spin rounded-full" />
              </div>
            ) : leads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No leads yet</p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm" data-testid="table-leads">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-xs tracking-[0.1em] text-muted-foreground font-medium">EMAIL</th>
                      <th className="text-left py-2 px-2 text-xs tracking-[0.1em] text-muted-foreground font-medium">WHATSAPP</th>
                      <th className="text-left py-2 px-2 text-xs tracking-[0.1em] text-muted-foreground font-medium">DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-border/50" data-testid={`row-lead-${lead.id}`}>
                        <td className="py-2 px-2 text-xs break-all">{lead.email}</td>
                        <td className="py-2 px-2 text-xs text-muted-foreground">{lead.whatsapp || "\u2014"}</td>
                        <td className="py-2 px-2 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [adminPw, setAdminPw] = useState<string | null>(null);

  if (!adminPw) {
    return <AdminLogin onLogin={setAdminPw} />;
  }

  return <AdminPanel adminPw={adminPw} />;
}
