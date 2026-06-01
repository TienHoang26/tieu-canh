import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatBot from '@/components/layout/Chatbot'
import NotificationToast from '@/components/layout/Notificationtoast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[118px]">{children}</main>
      <Footer />
      <ChatBot />
      <NotificationToast />
    </>
  )
}