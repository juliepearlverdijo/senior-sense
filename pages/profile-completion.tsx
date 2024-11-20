import AuthWrapper from "@/components/AuthWrapper";
import Layout from "@/components/Layout";
import Image from "next/image";

const ProfileCompletion = () => {
  return (
    <AuthWrapper>
      <Layout>
        <h1 className="text-center text-2xl font-semibold">
          Profile Completion
        </h1>
        <div className="pt-24">
          <ul className="flex flex-wrap w-full">
            <li className="w-1/3 flex flex-col items-center py-12 cursor-pointer">
              <Image
                src="/medical-history1.svg"
                alt="Medical History"
                width={200}
                height={200}
                className="mb-2 h-20 w-auto"
              />
              <h3>Medical History</h3>
            </li>
            <li className="w-1/3 flex flex-col items-center py-12 cursor-pointer">
              <Image
                src="/medication.svg"
                alt="Medication"
                width={200}
                height={200}
                className="mb-2 h-20 w-auto"
              />
              <h3>Medication</h3>
            </li>
            <li className="w-1/3 flex flex-col items-center py-12 cursor-pointer">
              <Image
                src="/doctors-appointment.svg"
                alt="Doctors Appointment"
                width={200}
                height={200}
                className="mb-2 h-20 w-auto"
              />
              <h3>Doctor's Appointments</h3>
            </li>
            <li className="w-1/3 flex flex-col items-center py-12 cursor-pointer">
              <Image
                src="/important-dates.svg"
                alt="Important Dates"
                width={200}
                height={200}
                className="mb-2 h-20 w-auto"
              />
              <h3>Important Dates</h3>
            </li>
            <li className="w-1/3 flex flex-col items-center py-12 cursor-pointer">
              <Image
                src="/lifestyle.svg"
                alt="Routines and Interests"
                width={200}
                height={200}
                className="mb-2 h-20 w-auto"
              />
              <h3>Routines and Interests</h3>
            </li>
            <li className="w-1/3 flex flex-col items-center py-12 cursor-pointer">
              <Image
                src="/communication-settings.svg"
                alt="Communications"
                width={200}
                height={200}
                className="mb-2 h-20 w-auto"
              />
              <h3>Communications</h3>
            </li>
          </ul>
        </div>
        <div className="pt-24"></div>
      </Layout>
    </AuthWrapper>
  );
};

export default ProfileCompletion;
