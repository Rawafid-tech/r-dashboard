import { useState } from "react";
import { Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from "@/shared/components/ui";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/stores/theme.store";
import { useLocaleStore } from "@/stores/locale.store";
import { useAuthStore } from "@/stores/auth.store";

export function UiPlayground() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { locale, setLocale } = useLocaleStore();
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);

  function handleLogout() {
    clearTokens();
    navigate("/register", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              UI Components Playground
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Shared shadcn components — customize via variants & className
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Theme: {theme}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            >
              Locale: {locale.toUpperCase()}
            </Button>
            <Button variant="destructive-outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Variants: default, outline, secondary, ghost, destructive,
              success, warning, link — sizes: xs → xl
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs">XS</Button>
              <Button size="sm">SM</Button>
              <Button size="default">Default</Button>
              <Button size="lg">LG</Button>
              <Button size="xl">XL</Button>
              <Button disabled>
                <Loader2 className="animate-spin" />
                Loading
              </Button>
              <Button fullWidth size="lg">
                Full width CTA
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inputs & Labels</CardTitle>
            <CardDescription>
              Use Field for label + input + error groups. Sizes via inputSize.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="owner@store.com"
                    className="ps-9"
                    inputSize="lg"
                  />
                </div>
                <FieldDescription>
                  We&apos;ll never share your email.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    inputSize="lg"
                    className="pe-10"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 end-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field data-invalid>
                <FieldLabel htmlFor="invalid">Invalid field</FieldLabel>
                <Input
                  id="invalid"
                  aria-invalid
                  defaultValue="bad-value"
                  inputSize="lg"
                />
                <FieldError>This field has an error</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="notes">Notes</FieldLabel>
                <Textarea id="notes" placeholder="Optional notes..." />
              </Field>

              <Field orientation="horizontal">
                <Checkbox
                  id="remember"
                  checked={checked}
                  onCheckedChange={(v) => setChecked(v === true)}
                />
                <FieldLabel htmlFor="remember" className="font-normal">
                  Remember me
                </FieldLabel>
              </Field>

              <Field>
                <Label htmlFor="country">Country</Label>
                <Select defaultValue="EG">
                  <SelectTrigger id="country" className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EG">Egypt</SelectItem>
                    <SelectItem value="SA">Saudi Arabia</SelectItem>
                    <SelectItem value="AE">UAE</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="muted">Muted</Badge>
            <Badge variant="success">Delivered</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="destructive">Failed</Badge>
          </CardContent>
        </Card>

        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Import from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            @/shared/components/ui
          </code>
        </p>
      </div>
    </div>
  );
}
