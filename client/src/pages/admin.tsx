import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Settings, Users, Lock, Upload, Image, Package, FileText, Loader2, Trash2, RefreshCw } from "lucide-react";
import type { DropSettings, Lead, BrandAsset, Mockup } from "@shared/schema";
import { SILHOUETTES } from "@shared/schema";

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

function DropSettingsSection({ adminPw, settings }: { adminPw: string; settings: DropSettings | undefined }) {
  const { toast } = useToast();
  const headers = { "x-admin-password": adminPw };
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

  return (
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
              onClick={() => { if (dropDate) updateSettings.mutate({ dropDate }); }}
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
              onClick={() => { if (shopifyUrl) updateSettings.mutate({ shopifyUrl }); }}
              disabled={!shopifyUrl || updateSettings.isPending}
              data-testid="button-save-url"
            >
              SAVE
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
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
  );
}

function LeadsSection({ adminPw }: { adminPw: string }) {
  const { toast } = useToast();
  const headers = { "x-admin-password": adminPw };

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/leads", { headers });
      if (!res.ok) throw new Error("Failed");
      return res.json();
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

  return (
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
      {isLoading ? (
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
  );
}

function BrandAssetsSection({ adminPw }: { adminPw: string }) {
  const { toast } = useToast();
  const headers: Record<string, string> = { "x-admin-password": adminPw };
  const [uploading, setUploading] = useState(false);

  const { data: assets = [], isLoading } = useQuery<BrandAsset[]>({
    queryKey: ["/api/admin/brand-assets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/brand-assets", { headers });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, name: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("name", name);
      const res = await fetch("/api/admin/brand-assets", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error("Failed");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brand-assets"] });
      toast({ title: `${name} uploaded` });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/brand-assets/${id}`, { method: "DELETE", headers });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brand-assets"] });
      toast({ title: "Asset deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const assetTypes = [
    { type: "wordmark", name: "Wordmark", desc: "Centre chest wordmark logo (PNG with transparency)" },
    { type: "icon", name: "Icon", desc: "Small icon for left chest placement" },
    { type: "tagline", name: "Tagline Lockup", desc: "Wordmark with THE UNIFORM OF NOW" },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="w-4 h-4" />
        <h2 className="font-mono text-sm tracking-[0.2em] font-medium">BRAND ASSETS</h2>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Upload brand assets for mockup generation. PNG with transparency recommended for best results.
        Default logos are used if no custom assets are uploaded.
      </p>

      <div className="flex flex-col gap-4">
        {assetTypes.map((at) => {
          const existing = assets.filter(a => a.type === at.type);
          return (
            <div key={at.type} className="border border-border p-4 rounded-none">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div>
                  <p className="text-sm font-medium">{at.name}</p>
                  <p className="text-xs text-muted-foreground">{at.desc}</p>
                </div>
                <label className="cursor-pointer" data-testid={`button-upload-${at.type}`}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => handleUpload(e, at.type, at.name)}
                    disabled={uploading}
                  />
                  <Button variant="outline" size="sm" className="rounded-none tracking-[0.1em] text-xs pointer-events-none" tabIndex={-1}>
                    {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                    UPLOAD
                  </Button>
                </label>
              </div>
              {existing.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {existing.map((asset) => (
                    <div key={asset.id} className="flex items-center gap-2 border border-border/50 px-2 py-1">
                      <img src={asset.filePath} alt={asset.name} className="w-8 h-8 object-contain" />
                      <span className="text-xs text-muted-foreground">{asset.width}x{asset.height}</span>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="text-muted-foreground/50 hover:text-destructive"
                        data-testid={`button-delete-asset-${asset.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </Card>
  );
}

function MockupGeneratorSection({ adminPw }: { adminPw: string }) {
  const { toast } = useToast();
  const headers: Record<string, string> = { "x-admin-password": adminPw, "Content-Type": "application/json" };

  const { data: existingMockups = [], isLoading: mockupsLoading } = useQuery<Mockup[]>({
    queryKey: ["/api/mockups"],
  });

  const generateAll = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/mockups/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Generation failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mockups"] });
      toast({ title: `Generated ${data.count} mockups` });
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const handleExportCSV = async () => {
    const res = await fetch("/api/admin/mockups/export-csv", { headers: { "x-admin-password": adminPw } });
    if (!res.ok) { toast({ title: "Export failed", variant: "destructive" }); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "d21-mockups-manifest.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportZIP = async () => {
    const res = await fetch("/api/admin/mockups/export-zip", { headers: { "x-admin-password": adminPw } });
    if (!res.ok) { toast({ title: "Export failed", variant: "destructive" }); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "d21-mockups.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const silhouetteGroups: Record<string, Mockup[]> = {};
  for (const m of existingMockups) {
    if (!silhouetteGroups[m.silhouette]) silhouetteGroups[m.silhouette] = [];
    silhouetteGroups[m.silhouette].push(m);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Image className="w-4 h-4" />
        <h2 className="font-mono text-sm tracking-[0.2em] font-medium">MOCKUP GENERATOR</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 border border-border p-4 rounded-none">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Batch Generate All Mockups</p>
            <p className="text-xs text-muted-foreground">
              Generates {SILHOUETTES.length} silhouettes &times; 2 colours &times; 2-3 variations = 20-24 mockups.
              Each exported as WebP (1600/1024/640) + JPG fallback.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              className="rounded-none tracking-[0.15em] text-xs"
              onClick={() => generateAll.mutate()}
              disabled={generateAll.isPending}
              data-testid="button-generate-all"
            >
              {generateAll.isPending ? (
                <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> GENERATING...</>
              ) : (
                <><RefreshCw className="w-3 h-3 mr-2" /> GENERATE ALL</>
              )}
            </Button>
          </div>
        </div>

        {existingMockups.length > 0 && (
          <div className="flex flex-col gap-3 border border-border p-4 rounded-none">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <p className="text-sm font-medium">Export Assets</p>
                <span className="text-xs text-muted-foreground">({existingMockups.length} mockups)</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none tracking-[0.1em] text-xs"
                  onClick={handleExportCSV}
                  data-testid="button-export-mockup-csv"
                >
                  <FileText className="w-3 h-3 mr-1" /> CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none tracking-[0.1em] text-xs"
                  onClick={handleExportZIP}
                  data-testid="button-export-mockup-zip"
                >
                  <Download className="w-3 h-3 mr-1" /> ZIP
                </Button>
              </div>
            </div>
          </div>
        )}

        {existingMockups.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">Generated Mockups Preview</p>
            {Object.entries(silhouetteGroups).map(([sil, items]) => {
              const silInfo = SILHOUETTES.find(s => s.id === sil);
              return (
                <div key={sil} className="border border-border/50 p-3 rounded-none">
                  <p className="text-xs tracking-[0.15em] font-medium mb-2 uppercase">{silInfo?.name || sil}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {items.map((m) => (
                      <div key={m.id} className="flex flex-col items-center gap-1" data-testid={`mockup-preview-${m.id}`}>
                        <div className="aspect-[4/5] w-full bg-muted overflow-hidden">
                          <img
                            src={m.filePath640 || m.filePath1024 || ""}
                            alt={m.altText || ""}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground text-center leading-tight">
                          {m.color} / {m.variation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {mockupsLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </Card>
  );
}

function AdminPanel({ adminPw }: { adminPw: string }) {
  const { data: settings, isLoading: settingsLoading } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border border-foreground/30 border-t-foreground animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-5 h-5" />
          <h1 className="font-mono text-lg tracking-[0.2em] font-bold">ADMIN PANEL</h1>
        </div>

        <div className="flex flex-col gap-6">
          <DropSettingsSection adminPw={adminPw} settings={settings} />
          <LeadsSection adminPw={adminPw} />
          <BrandAssetsSection adminPw={adminPw} />
          <MockupGeneratorSection adminPw={adminPw} />
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
