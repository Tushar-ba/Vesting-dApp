import React, { useState } from 'react';
import { ethers } from 'ethers';
import VestingABI from './utils/VestingABI'; // Update path accordingly

const YourComponent = () => {
    const [signer, setSigner] = useState(null);
    const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
    const [allocationAmount, setAllocationAmount] = useState('');
    const [roleType, setRoleType] = useState(0); // Default to Role.User, adjust as needed

    const connectToMetaMask = async () => {
        try {
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                setSigner(signer);
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
            const contractAddress = '0x5e5d8680212cfaf383cd5ce071535f4db7a056fc'; // Replace with your contract address
            const vestingContract = new ethers.Contract(contractAddress, VestingABI, signer);

            // Convert allocation amount to BigNumber if needed
            const allocation = ethers.parseUnits(allocationAmount, 18); // Assuming 18 decimal places

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
            const contractAddress = '0x5e5d8680212cfaf383cd5ce071535f4db7a056fc'; // Replace with your contract address
            const vestingContract = new ethers.Contract(contractAddress, VestingABI, signer);

            const tx = await vestingContract.claimTokens();
            await tx.wait();
            console.log('Tokens claimed successfully');
            // Optionally update UI or state upon success
        } catch (error) {
            console.error('Failed to claim tokens:', error);
        }
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
        </div>
    );
};

export default YourComponent;
