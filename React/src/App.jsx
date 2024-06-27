import React, { useState } from 'react';
import { ethers } from 'ethers';
import VestingABI from './utils/VestingABI'; 

const YourComponent = () => {
    const [signer, setSigner] = useState(null);
    const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
    const [allocationAmount, setAllocationAmount] = useState('');
    const [roleType, setRoleType] = useState(0); 
    const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);
    const [provider,setProvider]=useState(null);
    const [address,setAddress]=useState("Connect to MetaMask")
    const [connected,setConnected]=useState(false)
    const contractAddress ="0x51642fc9c056a12ea7fc2ea25ecadceaebcb7424"

    const connectToMetaMask = async () => {
        try {
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setSigner(signer);
                setProvider(provider);
                setAddress(address);
                setConnected(true)
                console.log("Wallet connected");
            } else {
                throw new Error('MetaMask not detected');
            }
        } catch (error) {
            console.error('Failed to connect to MetaMask:', error);
        }
    };
// adding benfi
    const handleAddBeneficiary = async () => {
      try {
          const vestingContract = new ethers.Contract(contractAddress, VestingABI, signer);

          
          const allocation = ethers.parseUnits(allocationAmount, 18); 

          
          const roleTypeUint8 = parseInt(roleType); 

          const tx = await vestingContract.addBeneficiary(beneficiaryAddress, roleTypeUint8, allocation);
          await tx.wait();
          console.log('Beneficiary added successfully');
         
      } catch (error) {
          console.error('Failed to add beneficiary:', error);
      }
  };
// claim tokens
    const handleClaimTokens = async () => {
        try {
            const vestingContract = new ethers.Contract(contractAddress, VestingABI, signer);

            const tx = await vestingContract.claimTokens();
            await tx.wait();
            console.log('Tokens claimed successfully');
           
        } catch (error) {
            console.error('Failed to claim tokens:', error);
        }
    };
// starting vesting
    const handleStartVesting = async () => {
        try {
            const vestingContract = new ethers.Contract(contractAddress, VestingABI, signer);

            const tx = await vestingContract.startVesting();
            await tx.wait();

            console.log('Vesting started successfully');
            
        } catch (error) {
            console.error('Failed to start vesting:', error);
        }
    };
// get details
    const handleGetBeneficiaryDetails = async () => {
      try {
          const vestingContract = new ethers.Contract(contractAddress, VestingABI, provider);

          const details = await vestingContract.getBeneficiaryDetails(beneficiaryAddress);
          setBeneficiaryDetails({
              allocation: ethers.formatUnits(details[0], 18),
              claimed: ethers.formatUnits(details[1], 18), 
              role: details[2]
          });
          console.log('Beneficiary details fetched successfully:', details);
      } catch (error) {
          console.error('Failed to fetch beneficiary details:', error);
      }
  };

    return (
        <div className='flex flex-col gap-6 justify-center items-center mt-10'>
            <button onClick={connectToMetaMask} className="truncate "> {connected ? address : "Connect to MetaMask"}</button>

            <div>
                <label>Beneficiary Address:</label>
                <input
                    type="text"
                    value={beneficiaryAddress}
                    onChange={(e) => setBeneficiaryAddress(e.target.value)}
                />
            </div>

            <div>
                <label>Allocation Amount:</label>
                <input
                    type="number"
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(e.target.value)}
                />
            </div>

            <div>
                <label>Role Type:</label>
                <select value={roleType} onChange={(e) => setRoleType(parseInt(e.target.value))}>
                    <option value={0}>User</option>
                    <option value={1}>Partner</option>
                    <option value={2}>Team</option>
                </select>
            </div>

            <button onClick={handleAddBeneficiary}>Add Beneficiary</button>
            <button onClick={handleClaimTokens}>Claim Tokens</button>
            <button onClick={handleStartVesting}>Start Vesting</button>

            <div className='flex flex-col gap-3 justify-center items-center'>
                <label>Beneficiary Address:</label>
                <input
                    type="text"
                    value={beneficiaryAddress}
                    onChange={(e) => setBeneficiaryAddress(e.target.value)}
                />
                <button onClick={handleGetBeneficiaryDetails} className='mt-5 '>Get Beneficiary Details</button>
                {beneficiaryDetails && (
                    <div className='w-[300px] bg-white text-[#000] rounded-md '>
                        <p>Allocation: {beneficiaryDetails.allocation}</p>
                        <p>Claimed: {beneficiaryDetails.claimed}</p>
                        <p>Role: {['User', 'Partner', 'Team'][beneficiaryDetails.role]}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YourComponent;
