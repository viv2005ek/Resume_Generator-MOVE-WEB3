import React, { useEffect, useState } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

// Module details
const moduleAddress = "0x496fa09cb3f485f75ba07edbb668b619a994bbc3033d5e5799b43790457e10eb";
const moduleName = "ResumeManager";

// Initialize Aptos client
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const App = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [isRegistered, setIsRegistered] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is registered and load data from localStorage if available
    if (connected) {
      checkUserRegistration();
      const savedData = localStorage.getItem("resumeData");
      if (savedData) {
        setUserDetails(JSON.parse(savedData));
        setIsRegistered(true);
      }
    }
  }, [connected]);

  // Check if user is registered
  const checkUserRegistration = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const resultData = await client.getAccountResource({
        accountAddress: account.address,
        resourceType: `${moduleAddress}::${moduleName}::Resume`,
      });

      if (resultData && resultData.data) {
        setIsRegistered(true);
        setUserDetails(resultData.data);
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.log("No resource found:", error);
      setIsRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  // Save resume data in Move
  const handleCreateResume = async (formData: any) => {
    if (!account) return;

    const payload: InputTransactionData = {
      data: {
        function: `${moduleAddress}::${moduleName}::create_resume`,
        typeArguments: [],
        functionArguments: [
          formData.name,
          formData.email,
          formData.phone,
          formData.address,
          formData.gender,
          formData.maritalStatus,
          formData.degree,
          formData.description,
          formData.skills,
          formData.experience,
        ],
      },
    };

    setLoading(true);
    try {
      await signAndSubmitTransaction(payload);
      setIsRegistered(true);
      setUserDetails(formData);
      // Store data in localStorage
      localStorage.setItem("resumeData", JSON.stringify(formData));
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full bg-blue-600 text-white text-center py-6 shadow-md">
        <h1 className="text-4xl font-bold">Resume Generator</h1>
      </header>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-lg">
            <div className="text-2xl font-semibold">Loading...</div>
          </div>
        </div>
      )}
      <div className="absolute right-4 top-16 z-10">
        <WalletSelector />
      </div>
      <main className="flex-grow flex items-center justify-center p-4 w-full">
        {connected ? (
          isRegistered ? (
            <InteractiveResume userDetails={userDetails} />
          ) : (
            <RegistrationForm onSubmit={handleCreateResume} />
          )
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-semibold">Please connect your wallet to continue</h1>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

// Interactive Resume Component
const InteractiveResume = ({ userDetails }: { userDetails: any }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-xl w-full max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-6">Your Resume</h1>
      {userDetails.pfp && (
        <div className="flex justify-center mb-6">
          <img
            src={userDetails.pfp}
            alt="Profile Picture"
            className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(userDetails).map((key) =>
          key !== "pfp" ? (
            <p key={key} className="mb-2">
              <strong>{key.replace("_", " ").toUpperCase()}:</strong> {userDetails[key]}
            </p>
          ) : null
        )}
      </div>
    </div>
  );
};

// Registration Form Component
const RegistrationForm = ({ onSubmit }: { onSubmit: (formData: any) => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Male",
    maritalStatus: "Single",
    degree: "",
    description: "",
    skills: "",
    experience: "",
    pfp: null as any,
  });

  useEffect(() => {
    // Pre-populate form with saved data from localStorage
    const savedData = localStorage.getItem("resumeData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setFormData({ ...formData, pfp: reader.result });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl w-full max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Register Your Details</h1>
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2">Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
      </div>
      {Object.keys(formData).map((key) => {
        if (key === "pfp") return null;

        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-bold mb-2">{key.replace("_", " ")}</label>
            {key === "gender" || key === "maritalStatus" ? (
              <select
                name={key}
                value={(formData as any)[key]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                {key === "gender" && (
                  <>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </>
                )}
                {key === "maritalStatus" && (
                  <>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </>
                )}
              </select>
            ) : (
              <input
                type={key === "description" || key === "skills" || key === "experience" ? "textarea" : "text"}
                name={key}
                value={(formData as any)[key]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            )}
          </div>
        );
      })}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full font-bold hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </div>
  );
};
