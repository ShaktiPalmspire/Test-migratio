import { LoginForm } from "@/components/login-form"
import AuthRedirect from "@/components/AuthRedirect";
import Heading from "../../../components/Headings/heading";
import Link from 'next/link';
export default function Page() {
  return (
    <AuthRedirect>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[600px]">
          <Heading as="h2" className="mb-6 text-center">
            <Link href="/" className="no-underline hover:no-underline text-[var(--migratio_white)] fw-600 migratio-link">
              Migratio
            </Link>
            </Heading>
          <LoginForm />
        </div>
      </div>
    </AuthRedirect>
  )
}
