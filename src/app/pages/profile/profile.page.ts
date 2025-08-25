import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { UserComponent } from '../../components/user/user.component';
import { ExpertiseComponent } from 'src/app/components/expertise/expertise.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { AuthService } from 'src/app/services/auth.service';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

import { ModalController } from '@ionic/angular';
import { EditUserModal } from 'src/app/components/edit-user-modal/edit-user-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    UserComponent,
    ExpertiseComponent,
    IonicModule,
    LoadingSpinnerComponent,
    DateFormatPipe,
  ],
})
export class ProfilePage implements OnInit {
  selectedTab: 'details' | 'expertise' = 'details';
  baseURL = 'http://localhost:8000';
  currentUser: any;
  users: any[] = [];
  selectedUser: any = null;
  loading = true;

  //Eskpertize
  areaSearch = '';
  areas: any[] = [];
  selectedArea: any = null;

  storedUser = localStorage.getItem('user_data');
  userId = this.storedUser ? JSON.parse(this.storedUser).user_id : '';
  newExpertise = {
    user_id: this.userId,
    area_id: '',
  };

  expertises: any[] = [];

  // Blockchain
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
  loadingBlockchain = false;
  constructor(
    private authService: AuthService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadUsers();
    this.loadExpertisesOfUser(this.currentUser.user_id);
  }

  async loadUsers() {
    try {
      const response = await fetch(`${this.baseURL}/api/getAllUsers`, {
        headers: this.authService.getAuthHeaders(),
      });
      const data = await response.json();
      this.loading = false;

      const allUsers = data.users || [];

      // sort: current user first, then by user_id descending
      this.users = allUsers.sort((a: any, b: any) => {
        if (a.user_id === this.currentUser.user_id) return -1; // a first
        if (b.user_id === this.currentUser.user_id) return 1; // b first
        return Number(b.user_id) - Number(a.user_id); // others by user_id desc
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  showUser(user: any) {
    if (user.user_id === this.currentUser.user_id) {
      this.showCurrentUser();
      return;
    }
    this.selectedUser = user;
    this.loadExpertisesOfUser(this.selectedUser.user_id);
  }

  showCurrentUser() {
    this.selectedUser = null;
    this.loadExpertisesOfUser(this.currentUser.user_id);
  }

  get displayedUser() {
    return this.selectedUser || this.currentUser;
  }

  // Edit modal
  async openEditModal(user: any) {
    const modal = await this.modalCtrl.create({
      component: EditUserModal,
      componentProps: { user },
    });

    modal.onDidDismiss().then((res) => {
      if (res.data) {
        // Update trenutnog usera na stranici
        this.currentUser = res.data;
        // Update u listi korisnika
        const index = this.users.findIndex(
          (u) => u.user_id === res.data.user_id
        );
        if (index >= 0) this.users[index] = res.data;
        // Update u localStorage
        localStorage.setItem('user_data', JSON.stringify(res.data));
      }
    });

    await modal.present();
  }

  // Blockchain

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

  // Ekspertize
  async searchAreas(query: string) {
    if (!query) {
      this.areas = [];
      return;
    }
    try {
      const response = await fetch(
        `${this.baseURL}/api/getAllAreasContainingLetters/${encodeURIComponent(
          query
        )}`,
        {
          headers: this.authService.getAuthHeaders(),
        }
      );
      const data = await response.json();
      this.areas = data.areas || [];
    } catch (error) {
      console.error('Error searching areas:', error);
      this.areas = [];
    }
  }

  selectArea(area: any) {
    this.selectedArea = area;
    this.newExpertise.area_id = area.area_id;
    this.areaSearch = area.name;
    this.areas = [];
  }

  handleAreaInputClick() {
    if (this.selectedArea) {
      this.selectedArea = null;
      this.areaSearch = '';
    }
  }

  async createExpertise() {
    if (!this.selectedArea) {
      alert('Please select an area.');
      return;
    }
    const exists = this.expertises.some(
      (exp) => exp.area_id === this.newExpertise.area_id
    );
    if (exists) {
      alert('Already exists');
      return;
    }
    try {
      const response = await fetch(`${this.baseURL}/api/createExpertise`, {
        method: 'POST',
        headers: this.authService.getAuthHeaders(),
        body: JSON.stringify(this.newExpertise),
      });
      if (response.ok) {
        this.newExpertise.area_id = '';
        this.selectedArea = null;
        this.areaSearch = '';
        this.areas = [];
        this.loadExpertisesOfUser(this.userId);
      } else {
        alert('Failed to submit fact');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting fact');
    }
  }

  // Prikaz ekspertize
  async loadExpertisesOfUser(userId: number) {
    this.expertises = [];
    try {
      const response = await fetch(
        `${this.baseURL}/api/getAllExpertisesOfUser/${userId}`,
        {
          headers: this.authService.getAuthHeaders(),
        }
      );
      const data = await response.json();
      this.expertises = (data.expertises || []).sort(
        (a: any, b: any) => Number(b.expertise_id) - Number(a.expertise_id)
      );
      console.log(this.expertises);
    } catch (error) {
      console.error('Error fetching expertises:', error);
    }
  }
}
