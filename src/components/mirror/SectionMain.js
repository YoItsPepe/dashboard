import React, { Component } from 'react';

import Web3 from 'web3';
import { MIRROR_ADDRESS, MIRRORABI } from '../../config'
import Grid from '@material-ui/core/Grid';

const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

export default class SectionMain extends Component {

  constructor(){
    super();
    this.state = { 
      account: '',
      web3: null,
      loading: true,
      showLoading: false,
      mirrorContract: '',
      mirrorBalance: '',
      morWholeBurn: '',
      morRFIBurn: '',
      userFarmedMor: '',
      morReflected: '',
      morCireculating: '',
      mirrorPrice: '',
      farmer0: '',
      farmer1: '',
      farmer2: '',
      farmer3: '',
      farmer4: '',
      farmer0amt: '',
      farmer1amt: '',
      farmer2amt: '',
      farmer3amt: '',
      farmer4amt: '',
      totalFarmers: 0,
      farmerCheckedCount: 0,
      farmingLeaderboardArr: [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
      mirrorCardWidth: '95%',
    };

  }

  componentDidMount() {
    this.connectWeb3();
  }
  //Connect to web3
  async connectWeb3(){
    var newWeb3 = null;
    if (window.ethereum){
      newWeb3 = new Web3(window.ethereum);
      window.ethereum.enable();
      this.setState({ web3: newWeb3 });
      this.reloadData();
      window.ethereum.on("accountsChanged", (accounts) => {
        this.setState({ account: accounts });
        this.setState({ approved: false });
        this.reloadData();
      })
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      newWeb3 = new Web3(window.web3.currentProvider);
      this.setState({ web3: newWeb3 });
      window.web3.currentProvider.on("accountsChanged", (accounts) => {
        this.setState({ approved: false });
        this.reloadData();
      })
    }
    // Non-dapp browsers...
    else {
      console.log("Not a DAPP browser");
    }
    this.connectAndLoad();
  }


  // Connect and load contracts and data as needed 
  async connectAndLoad(){
    if (this.state.web3 != null){
      const accounts = await this.state.web3.eth.getAccounts();
      try{
        if (accounts[0].substr(0, 2) == '0x'){
          this.setState({ account: accounts });
        }
        else{
          alert("Connection failed");
        }
      }
      catch (err){
        console.log("No wallet address");
      }

      const morContract = new this.state.web3.eth.Contract(MIRRORABI, MIRROR_ADDRESS);
      this.setState({ mirrorContract: morContract });
      this.setState({ loading: false })
      this.reloadData();
      this.reloadFarmingLeaderboard();
      setInterval(async () => {
        this.reloadData();
      }, 5000);

    }
  }

  async reloadFarmingLeaderboard(){
    this.setState({loadingLeaderBoard: true});
    var numFarmers = 0;
    var leaders = [];
    var smallest = 0;
    try{
      numFarmers = await this.state.mirrorContract.methods.numFarmers().call();
      this.setState({totalFarmers: numFarmers});
    }
    catch (err){
      console.log('Something broke when building the leaderboard');
      console.log(err);
    }

    for (let i = 0; i < numFarmers; i++){
      const farmerAddress = await this.state.mirrorContract.methods.farmingLUT(i).call();
      const farmedAmount = await (this.state.mirrorContract.methods.farmingLeaderboard(farmerAddress).call()/10**18);
      leaders.push([farmedAmount, farmerAddress]);
      this.setState({farmerCheckedCount: this.state.farmerCheckedCount+1})
    }
    const sortedLeaders = leaders.sort(this.sortFunction);
    console.log('sortedLeaders');
    console.log(sortedLeaders);

    this.setState({farmingLeaderboardArr: sortedLeaders});

    this.setState({loadingLeaderBoard: false});
    
  }

  sortFunction(a,b){
    if (a[0] === b[0]) {
      return 0;
    }
    else {
      return (a[0] < b[0]) ? -1 : 1;
    }
  }

  reloadData(){
    this.getMirrorPrice();
    this.getTokenBalance();
    this.getMorWholeBurn();
    this.getMorRFIBurn();
    this.getMorReflect();
    this.getFarmers();
    this.getUserFarmedMor();
  }

  async getMorReflect(){
    try{
      const amount = await this.state.mirrorContract.methods.totalFees().call();
      this.setState({morReflected: Math.floor((amount/10**18)*100)/100});
    }
    catch (err){
      console.log('Something broke when fetchin whole burn balance');
      console.log(err);
    }
  }

  async getFarmers(){
    try{
      const farm0 = await this.state.mirrorContract.methods.farmers(0).call();
      const farm0amt = await (this.state.mirrorContract.methods.farmingLeaderboard(farm0).call()/10**18);
      console.log("Farm 0 " + farm0amt)
      const farm1 = await this.state.mirrorContract.methods.farmers(1).call();
      const farm1amt = await (this.state.mirrorContract.methods.farmingLeaderboard(farm1).call()/10**18);
      const farm2 = await this.state.mirrorContract.methods.farmers(2).call();
      const farm2amt = await (this.state.mirrorContract.methods.farmingLeaderboard(farm2).call()/10**18);
      const farm3 = await this.state.mirrorContract.methods.farmers(3).call();
      const farm3amt = await (this.state.mirrorContract.methods.farmingLeaderboard(farm3).call()/10**18);
      const farm4 = await this.state.mirrorContract.methods.farmers(4).call();
      const farm4amt = await (this.state.mirrorContract.methods.farmingLeaderboard(farm4).call()/10**18);
      this.setState({farmer0: farm0});
      this.setState({farmer1: farm1});
      this.setState({farmer2: farm2});
      this.setState({farmer3: farm3});
      this.setState({farmer4: farm4});
      this.setState({farmer0amt: farm0amt});
      this.setState({farmer1amt: farm1amt});
      this.setState({farmer2amt: farm2amt});
      this.setState({farmer3amt: farm3amt});
      this.setState({farmer4amt: farm4amt});
    }
    catch (err){
      console.log('Something broke when fetching farmers');
      console.log(err);
    }
  }

  async getMorWholeBurn(){
    try{
      const amount = await this.state.mirrorContract.methods.balanceOf("0x0000000000000000000000000000000000000000").call();
      this.setState({morWholeBurn: Math.floor((amount/10**18)*100)/100});
    }
    catch (err){
      console.log('Something broke when fetchin whole burn balance');
      console.log(err);
    }
  }

  async getMorRFIBurn(){
    try{
      const amount1 = await this.state.mirrorContract.methods.balanceOf("0x000000000000000000000000000000000000dead").call();
      const amount2 = await this.state.mirrorContract.methods.balanceOf("0x9a12bb849b1747a7c0759636a3c9d7c1d0a0bce7").call();
      let amount = (amount1*1) + (amount2*1);
      this.setState({morRFIBurn: Math.floor((amount/10**18)*100)/100});
    }
    catch (err){
      console.log('Something broke when fetchin rfi burn balance');
      console.log(err);
    }
  }



  // Get user token balance
  async getTokenBalance(){
    try{
      const amount = await this.state.mirrorContract.methods.balanceOf(this.state.account[0]).call();
      this.setState({mirrorBalance: Math.floor((amount/10**18)*100)/100});
      console.log(amount);
    }
    catch (err){
      console.log('Something broke when fetchin user balance');
      console.log(err);
    }
  }


  // Get user rewards
  async getUserRewards(){
    if (this.state.web3 !== null && this.state.mirrorContract !== null && this.state.account !== ''){
      const amount = await this.state.mirrorContract.methods.CHECKREWARD().call({ from: this.state.account[0] });
      if (amount >= 50000000){
        this.setState({userRewards: 0});
      }
      else{
        this.setState({userRewards: Math.floor(amount*100)/100});
      }
      
    }
    else{
      console.log('Web3 broken');
    }
  }


  // Get burned tokens
  async getTotalBurned(){
    if (this.state.web3 !== null && this.state.mirrorContract !== null && this.state.account !== ''){
      const amount = await this.state.mirrorContract.methods.totalBurned().call();
      this.setState({totalBurned: Math.ceil(((amount/1000000000000000000)*100)/100)});
    }
    else{
      console.log('Web3 broken');
    }
  }

  async getUserFarmedMor(){
    try{
      const amount = await this.state.mirrorContract.methods.totalBurned().call();
    }
    catch(err){
      console.log("Something failed when fetching user farmed mor")
    }
  }

  async getMirrorPrice(){
    /*const priceObject = await CoinGeckoClient.simple.price({
      ids: 'mirror-farm',
      vs_currencies: 'usd',
    })
    const mirrorObject = priceObject.data['mirror-farm']
    this.setState({ mirrorPrice: mirrorObject.usd })
    */
  }
  //{color: this.state.showTab2 ? "#A933ff" : "#000", borderColor: "#fff", backgroundColor: "#fff",  }

  render() {
    const { showTab1, showTab2, showTab3 } = this.state;
    return (
        <> 
          <nav className="navbar navbar-expand-lg navbar-dark navbar-stick-dark" data-navbar="static" backgroundColor="black" color="black">
            <div className="container" backgroundColor="black">

              <div className="navbar-left" backgroundColor="black">
                <button className="navbar-toggler" type="button"></button>
                
                    <a href="https://mirror.farm"><img className="logo-dark" width="88px" height="66px" src="https://i.ibb.co/xsCx8wj/mor.png" alt="logo"></img></a>
              </div>
              { this.state.loading 
                ? <button className="btn btn-primary" onClick={() => this.connectWeb3()} style={{ fontSize: '85%', marginRight: '40px' }}>Connect</button>
                    
              : <div style={{ fontSize: '85%', marginRight: '40px', color:'white' }}>Wallet: <span style={{color:"#72ff56"}}>{" " + this.state.account[0].substring(0, 8) + "***"}</span></div>
              }
            </div>
        </nav>
        { this.state.loading 
          ? <div>
            <img src="https://i.ibb.co/S5cnbQz/Mirror-Animated.gif" alt="mirrorLoading.png" height="80%" width="100%"/>
          </div>
          : <main className="main-content">
              <section className="section" style= {{backgroundColor: "#000", paddingTop: '40px', paddingBottom: '200px'}}>
                <div className="container" style={{color:"white"}} align="center">
                  <h2 style={{color:"white"}}>Mirror <span style={{color:"#72ff56"}}>Farm</span> Dashboard - Frictionless <span style={{color:"#72ff56"}}>Farming</span> Redefined</h2>
                  <button 
                  onClick={e => {
                    const win = window.open('https://v1.exchange.pancakeswap.finance/#/swap?inputCurrency=0x85e5682Cc4513358f765cb8Df98f1DD140c6cF86', "_blank");
                    win.focus();
                  }} 
                  className="btn btn-primary" 
                  style={{borderRadius: '80px'}}
                  >
                    <img height="20px" width="20px" src="https://cdn-images-1.medium.com/max/182/1*5Q-6o7N6kt4R9ln30IikEw@2x.png" style={{marginRight: '5px'}}></img>Trade on Pancakeswap
                  </button>
                  <br/>
                  <br/>
                  <Grid container direction="row">
                    <Grid container item md={6} xs={6} alignItems="center" justify="center">
                      <div style={{width: this.state.mirrorCardWidth, backgroundColor: '#333333', borderRadius: '80px'}}>
                        Wallet Balance:
                        <br/>
                        <span style={{color:"#72ff56"}}>{(this.state.mirrorBalance*1).toFixed(2).toLocaleString()} MOR</span>
                      </div>
                    </Grid>
                    <Grid container item md={6} xs={6} alignItems="center" justify="center">
                      <div style={{width: this.state.mirrorCardWidth, backgroundColor: '#333333', borderRadius: '80px'}}>
                        Your Farmed Mirror:
                        <br/>
                        {this.state.myFarmedMor} MOR
                        <br/>
                      </div>
                    </Grid>
                  </Grid>
                  <br/>
                  <Grid container direction="row">
                    <Grid container item md={6} xs={6} alignItems="center" justify="center">
                      <div style={{width: this.state.mirrorCardWidth, backgroundColor: '#333333', borderRadius: '80px'}}>
                        Wormhole Burn:
                        <br/>
                        {(this.state.morWholeBurn/1000000).toFixed(2).toLocaleString()} Million MOR
                      </div>
                    </Grid>
                    <Grid container item md={6} xs={6} alignItems="center" justify="center">
                      <div style={{width: this.state.mirrorCardWidth, backgroundColor: '#333333', borderRadius: '80px'}}>
                        Reflect Burn:
                        <br/>
                        {(this.state.morRFIBurn/1000000).toFixed(2).toLocaleString()} Million MOR
                      </div>
                    </Grid>
                  </Grid>
                  <br/>
                  <Grid container direction="row">
                    <Grid container item md={6} xs={6} alignItems="center" justify="center">
                      <div style={{width: this.state.mirrorCardWidth, backgroundColor: '#333333', borderRadius: '80px'}}>
                        Total Burned:
                        <br/>
                        {(((this.state.morWholeBurn*1 + this.state.morRFIBurn*1)/1000000).toFixed(2)).toLocaleString()} Million MOR
                      </div>
                    </Grid>
                    <Grid container item md={6} xs={6} alignItems="center" justify="center">
                      <div style={{width: this.state.mirrorCardWidth, backgroundColor: '#333333', borderRadius: '80px'}}>
                        Circulating:
                        <br/>
                        {((1000000000 - this.state.morWholeBurn - this.state.morRFIBurn - 54400000)/1000000).toFixed(2).toLocaleString()} Million MOR
                      </div>
                      <br/>
                    </Grid>
                  </Grid>
                  <br/>
                  <Grid container direction="row">
                    <Grid container item md={6} xs={6} alignItems="center" justify="center">
                      <div style={{width: this.state.mirrorCardWidth, backgroundColor: '#333333', borderRadius: '80px'}}>
                        Total Reflect Rewards:
                        <br/>
                        {(((this.state.morReflected)/1000000).toFixed(2)).toLocaleString()} Million MOR
                      </div>
                    </Grid>
                    <Grid container item md={6} xs={6} alignItems="center" justify="center">
                      <div style={{width: this.state.mirrorCardWidth, backgroundColor: '#333333', borderRadius: '80px'}}>
                        Mirror Price:
                        <br/>
                        0.000505 USD
                      </div>
                      <br/>
                    </Grid>
                  </Grid>
                  <br/>
                  <Grid container direction="row" alignItems="center" justify="center">
                    <Grid container item md={3} xs={2} alignItems="center" justify="center">
                    </Grid>
                    <Grid container item md={6} xs={8} style={{backgroundColor: '#333333'}} alignItems="center" justify="center">
                        Active Farmers
                        <br/>Farmer 1: {this.state.farmer0.substr(0,6)+'...'+this.state.farmer0.substr(38,42)} - {this.state.farmer0amt}
                        <br/>Farmer 2: {this.state.farmer1.substr(0,6)+'...'+this.state.farmer1.substr(38,42)} - {this.state.farmer1amt}
                        <br/>Farmer 3: {this.state.farmer2.substr(0,6)+'...'+this.state.farmer2.substr(38,42)} - {this.state.farmer2amt}
                        <br/>Farmer 4: {this.state.farmer3.substr(0,6)+'...'+this.state.farmer3.substr(38,42)} - {this.state.farmer3amt}
                        <br/>Farmer 5: {this.state.farmer4.substr(0,6)+'...'+this.state.farmer4.substr(38,42)} - {this.state.farmer4amt}
                    </Grid>
                    <Grid container item md={3} xs={2} alignItems="center" justify="center">
                    </Grid>
                  </Grid>
                  <br/>
                  <Grid container direction="row" alignItems="center" justify="center">
                    <Grid container item md={3} xs={2} alignItems="center" justify="center">
                    </Grid>
                    <Grid container item md={6} xs={8} style={{backgroundColor: '#333333'}} alignItems="center" justify="center">
                        {!this.state.loadingLeaderBoard 
                        ?
                        <div>
                          Farming Leaderboard (Top 10)
                          <br/>Farmer 1: {this.state.farmingLeaderboardArr[0][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[0][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[0][1]).substr(38,42)}
                          <br/>Farmer 2: {this.state.farmingLeaderboardArr[1][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[1][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[1][1]).substr(38,42)}
                          <br/>Farmer 3: {this.state.farmingLeaderboardArr[2][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[2][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[2][1]).substr(38,42)}
                          <br/>Farmer 4: {this.state.farmingLeaderboardArr[3][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[3][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[3][1]).substr(38,42)}
                          <br/>Farmer 5: {this.state.farmingLeaderboardArr[4][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[4][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[4][1]).substr(38,42)}
                          <br/>Farmer 6: {this.state.farmingLeaderboardArr[5][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[5][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[5][1]).substr(38,42)}
                          <br/>Farmer 7: {this.state.farmingLeaderboardArr[6][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[6][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[6][1]).substr(38,42)}
                          <br/>Farmer 8: {this.state.farmingLeaderboardArr[7][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[7][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[7][1]).substr(38,42)}
                          <br/>Farmer 9: {this.state.farmingLeaderboardArr[8][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[8][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[8][1]).substr(38,42)}
                          <br/>Farmer 10: {this.state.farmingLeaderboardArr[9][0].toFixed(2)} - {(''+this.state.farmingLeaderboardArr[9][1]).substr(0,6) + '...' + (''+this.state.farmingLeaderboardArr[9][1]).substr(38,42)}
                        </div>
                        :
                        <div>
                          Loading Leaderboard<br/>
                          <img src="https://i.gifer.com/bfR.gif" alt="loading.gif"></img><br/>
                          {this.state.farmerCheckedCount}/{this.state.totalFarmers}
                        </div>
                        }

                    </Grid>
                    <Grid container item md={3} xs={2} alignItems="center" justify="center">
                    </Grid>
                  </Grid>
                </div>
              </section>
            </main> 
        }
      </>
    );
  }
}
