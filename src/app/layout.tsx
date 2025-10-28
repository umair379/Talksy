import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "Talksy 💬",
  description: "Chat and connect with people easily",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
