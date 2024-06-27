import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VestingABI from './utils/VestingABI'; // Update path accordingly

const YourComponent = () => {
    const [signer, setSigner] = useState(null);
    const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
    const [allocationAmount, setAllocationAmount] = useState('');
    const [roleType, setRoleType] = useState(0); // Default to Role.User, adjust as needed
    const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);
    const [provider, setProvider] = useState(null);
    const [startTimestamp, setStartTimestamp] = useState(0);
    const [vestingStarted, setVestingStarted] = useState(false);
    const [vestingTimePassed, setVestingTimePassed] = useState(0);

    const connectToMetaMask = async () => {
        try {
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = provider.getSigner();
                setSigner(signer);
                setProvider(provider);
                console.log("Wallet connected");
            } else {
                throw new Error('MetaMask not detected');
            }
        } catch (error) {
            console.error('Failed to connect to MetaMask:', error);
        }
    };

    const handleAddBeneficiary = async () => {
        try {
            const contractAddress = '0x06f86e3dacf4d4dc007cacc2c5402bf001f5fee4'; // Replace with your contract address
            const vestingContract = new ethers.Contract(contractAddress, VestingABI, signer);

            // Convert allocation amount to BigNumber if needed
            const allocation = ethers.utils.parseUnits(allocationAmount, 18); // Assuming 18 decimal places

            // Convert roleType to uint8 if necessary
            const roleTypeUint8 = parseInt(roleType); // Assuming roleType is already an integer

            const tx = await vestingContract.addBeneficiary(beneficiaryAddress, roleTypeUint8, allocation);
            await tx.wait();
            console.log('Beneficiary added successfully');
            // Optionally update UI or state upon success
        } catch (error) {
            console.error('Failed to add beneficiary:', error);
        }
    };

    const handleClaimTokens = async () => {
        try {
            const contractAddress = '0x06f86e3dacf4d4dc007cacc2c5402bf001f5fee4'; // Replace with your contract address
            const vestingContract = new ethers.Contract(contractAddress, VestingABI, signer);

            const tx = await vestingContract.claimTokens();
            await tx.wait();
            console.log('Tokens claimed successfully');
            // Optionally update UI or state upon success
        } catch (error) {
            console.error('Failed to claim tokens:', error);
        }
    };

    const handleGetBeneficiaryDetails = async () => {
        try {
            const contractAddress = '0x06f86e3dacf4d4dc007cacc2c5402bf001f5fee4'; // Replace with your contract address
            const vestingContract = new ethers.Contract(contractAddress, VestingABI, provider);

            const details = await vestingContract.getBeneficiaryDetails(beneficiaryAddress);
            setBeneficiaryDetails({
                allocation: ethers.utils.formatUnits(details[0], 18), // Convert from BigNumber to string
                claimed: ethers.utils.formatUnits(details[1], 18), // Convert from BigNumber to string
                role: details[2]
            });
            console.log('Beneficiary details fetched successfully:', details);
        } catch (error) {
            console.error('Failed to fetch beneficiary details:', error);
        }
    };

    const handleStartVesting = async () => {
        try {
            const contractAddress = '0x06f86e3dacf4d4dc007cacc2c5402bf001f5fee4'; // Replace with your contract address
            const vestingContract = new ethers.Contract(contractAddress, VestingABI, signer);

            const tx = await vestingContract.startVesting();
            await tx.wait();

            const startTimestampBN = await vestingContract.startTimestamp();
            const vestingStarted = await vestingContract.vestingStarted();

            setStartTimestamp(startTimestampBN.toNumber());
            setVestingStarted(vestingStarted);

            console.log('Vesting started successfully');
            // Optionally update UI or state upon success
        } catch (error) {
            console.error('Failed to start vesting:', error);
        }
    };

    const fetchVestingTime = async () => {
      try {
          if (!provider) {
              throw new Error('Ethereum provider not initialized');
          }

          const contractAddress = '0x06f86e3dacf4d4dc007cacc2c5402bf001f5fee4'; // Replace with your contract address
          const vestingContract = new ethers.Contract(contractAddress, VestingABI, provider);

          const started = await vestingContract.vestingStarted();
          if (!started) {
              console.log('Vesting has not started yet');
              return;
          }

          const startTimestampBN = await vestingContract.startTimestamp();
          const startTimestamp = ethers.BigNumber.from(startTimestampBN).toNumber(); // Convert BigNumber to number

          if (isNaN(startTimestamp)) {
              throw new Error('Invalid startTimestamp value');
          }

          const currentTime = Math.floor(Date.now() / 1000);
          const timePassed = currentTime - startTimestamp;

          setStartTimestamp(startTimestamp);
          setVestingTimePassed(timePassed);

          console.log('Fetched vesting time successfully');
      } catch (error) {
          console.error('Failed to fetch vesting time:', error);
      }
  };

    const formatTime = (seconds) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const remainingSeconds = seconds % 60;

        return `${days} days, ${hours} hours, ${minutes} minutes, ${remainingSeconds} seconds`;
    };

    return (
        <div>
            <button onClick={connectToMetaMask}>Connect to MetaMask</button>

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

            <div>
                <label>Beneficiary Address:</label>
                <input
                    type="text"
                    value={beneficiaryAddress}
                    onChange={(e) => setBeneficiaryAddress(e.target.value)}
                />
                <button onClick={handleGetBeneficiaryDetails}>Get Beneficiary Details</button>
                {beneficiaryDetails && (
                    <div>
                        <p>Allocation: {beneficiaryDetails.allocation}</p>
                        <p>Claimed: {beneficiaryDetails.claimed}</p>
                        <p>Role: {['User', 'Partner', 'Team'][beneficiaryDetails.role]}</p>
                    </div>
                )}
            </div>
            {/* <div>
                <button onClick={handleStartVesting}>Start Vesting</button>
                <button onClick={fetchVestingTime}>Fetch Vesting Time</button>
                {vestingStarted && (
                    <div>
                        <p>Vesting started at: {new Date(startTimestamp * 1000).toLocaleString()}</p>
                        <p>Time passed since vesting started: {formatTime(vestingTimePassed)}</p>
                    </div>
                )}
            </div> */}
        </div>
    );
};

export default YourComponent;
