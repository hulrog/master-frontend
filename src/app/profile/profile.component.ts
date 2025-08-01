import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [FormsModule, UserComponent, IonicModule],
})
export class ProfileComponent implements OnInit {
  baseURL = 'http://localhost:8000';
  users: any[] = [];
  showForm: boolean = false;
  web3: Web3 | null = null;
  account: string | null = null;
  contract: any = null;
  historianName: string = '';
  historianInstitution: string = '';
  contractABI = [
    {
      inputs: [
        {
          internalType: 'string',
          name: 'name',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'institution',
          type: 'string',
        },
      ],
      name: 'registerHistorian',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getMyInfo',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];
  contractAddress = '0x3295C4926226F7002AAd4461a55Cd4E82738816D';
  isRegistered: boolean = false;
  newTopic = {
    name: '',
    area_name: '',
  };
  constructor() {}

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response = await fetch(`${this.baseURL}/api/getAllUsers`);
      const data = await response.json();
      this.users = (data.users || []).sort(
        (a: any, b: any) => Number(b.user_id) - Number(a.user_id)
      );
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  async connectMetaMask() {
    if ((window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        this.web3 = new Web3((window as any).ethereum);
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        this.contract = new this.web3.eth.Contract(
          this.contractABI,
          this.contractAddress
        );

        console.log('MetaMask connected:', this.account);

        try {
          await this.contract.methods.getMyInfo().call({ from: this.account });
          this.isRegistered = true;
          return;
        } catch (error) {
          console.error('Error fetching historian info:', error);
          this.isRegistered = false;
          alert('Error fetching registration info.)');
        }
      } catch (error) {
        console.error('User denied account access or error:', error);
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask extension.');
    }
  }

  async registerHistorian(name: string, institution: string) {
    if (!this.contract || !this.account) {
      alert('Connect MetaMask first!');
      return;
    }
    try {
      await this.contract.methods
        .registerHistorian(name, institution)
        .send({ from: this.account });
      alert('Registration successful!');
    } catch (err) {
      console.error(err);
      alert('Registration failed or rejected.');
    }
  }

  async getHistorianInfo() {
    if (!this.contract || !this.account) {
      alert('Connect MetaMask first!');
      return;
    }

    try {
      const result = await this.contract.methods
        .getMyInfo()
        .call({ from: this.account });

      const name = result[0];
      const institution = result[1];

      alert(`Your Info:\nName: ${name}\nInstitution: ${institution}`);
    } catch (err) {
      console.error(err);
      alert('You are not registered or an error occurred.');
    }
  }

  async createNewTopic() {
    console.log('Creating new topic:', this.newTopic);
    try {
      const response = await fetch(`${this.baseURL}/api/createTopic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newTopic),
      });
      if (response.ok) {
        this.newTopic.name = '';
        this.newTopic.area_name = '';
      } else {
        alert('Failed to create topic');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting topic');
    }
  }
}
