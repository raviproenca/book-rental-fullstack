import { AccountSettingsSections } from "@/components/settings/AccountSettingsSections";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conta, segurança, assinatura e preferências do aplicativo.
        </p>
      </div>
      <AccountSettingsSections />
    </div>
  );
}
