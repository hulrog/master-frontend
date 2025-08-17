import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { UserComponent } from '../../components/user/user.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [FormsModule, UserComponent, IonicModule, LoadingSpinnerComponent],
})
export class ProfilePage implements OnInit {
  baseURL = 'http://localhost:8000';
  users: any[] = [];
  showForm: boolean = false;
  web3: Web3 | null = null;
  account: string | null = null;
  contract: any = null;
  historianName: string = '';
  historianInstitution: string = '';
  historianMessage: string = '';
  contractABI = [
    {
      inputs: [
        {
          internalType: 'string',
          name: 'content',
          type: 'string',
        },
      ],
      name: 'postMessage',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
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
      name: 'getAllMessages',
      outputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'sender',
              type: 'address',
            },
            {
              internalType: 'string',
              name: 'content',
              type: 'string',
            },
          ],
          internalType: 'struct HistorianRegistryTest.Message[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
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
  contractAddress = '0xc60894c352237Ca2DCc76193e1CE0c8EfBc5De1C';
  isRegistered: boolean = false;
  newTopic = {
    name: '',
    area_name: '',
  };
  loading = true;
  loadingBlockchain = false;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response = await fetch(`${this.baseURL}/api/getAllUsers`, {
        headers: this.authService.getAuthHeaders(),
      });
      const data = await response.json();
      this.loading = false;
      this.users = (data.users || []).sort(
        (a: any, b: any) => Number(b.user_id) - Number(a.user_id)
      );
      console.log('Users loaded:', this.users);
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
          this.isRegistered = false;
          alert('Please register!');
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
    this.loadingBlockchain = true;

    try {
      this.isRegistered = true;
      await this.contract.methods
        .registerHistorian(name, institution)
        .send({ from: this.account });
      alert('Registration successful!');
    } catch (err) {
      this.isRegistered = false;
      console.error(err);
      alert('Registration failed or rejected.');
    }

    this.loadingBlockchain = false;
  }

  async postMessage(message: string) {
    this.loadingBlockchain = true;
    if (!this.contract || !this.account) {
      alert('Connect MetaMask first!');
      return;
    }
    try {
      await this.contract.methods
        .postMessage(message)
        .send({ from: this.account });
      alert('Message successful!');
      this.historianMessage = '';
    } catch (err) {
      console.error(err);
      alert('Message failed.');
    }
    this.loadingBlockchain = false;
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

      console.log('Historian info:', result);

      const name = result[0];
      const institution = result[1];

      alert(`Your Info:\nName: ${name}\nInstitution: ${institution}`);
    } catch (err) {
      console.error(err);
      alert('You are not registered or an error occurred.');
    }
  }

  async showMessages() {
    if (!this.contract || !this.account) {
      alert('Connect MetaMask first!');
      return;
    }

    try {
      const result = await this.contract.methods
        .getAllMessages()
        .call({ from: this.account });

      const messages = result
        .map((msg: any, index: number) => {
          return `#${index + 1}\nFrom: ${msg.sender}\nMessage: ${
            msg.content
          }\n`;
        })
        .join('\n---\n');

      alert(messages || 'No messages found.');
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
        headers: this.authService.getAuthHeaders(),
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
