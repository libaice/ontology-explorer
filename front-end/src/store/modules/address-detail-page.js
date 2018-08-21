import axios from 'axios'
import * as types from "../mutation-type"

/**
 * 计算总共多少ONT和ONG，lyx。
 *
 * @param myAddress
 * @param trans
 * @return {*}
 */
function getTransAmount(myAddress, trans) {
  let txnLists = trans.TxnList

  for(let val in txnLists) {
    let txnList = txnLists[val].TransferList;
    let ont = 0;
    let ong = 0;

    for(let tx in txnList) {
      if(txnList[tx].FromAddress === myAddress) {
        if(txnList[tx].AssetName === 'ont') {
          ont -= Number(txnList[tx].Amount)
        } else {
          ong -= Number(txnList[tx].Amount)
        }
      } else {
        if(txnList[tx].AssetName === 'ont') {
          ont += Number(txnList[tx].Amount)
        } else {
          ong += Number(txnList[tx].Amount)
        }
      }
    }

    txnLists[val].amount = {
      ont: ont,
      ong: ong
    }
  }

  trans.TxnList = txnLists;

  return trans
}

export default {
  state: {
    AddressDetail: {
      info: '',
    }
  },
  mutations: {
    [types.SET_ADDRESS_DETAIL_PAGE](state, payload) {
      state.AddressDetail.info = payload.info
    }
  },
  actions: {
    getAddressDetailPage({dispatch, commit},$param) {
      let apiUrl = ($param.net === "testnet") ? process.env.TEST_API_URL : process.env.API_URL;

      return axios.get(apiUrl + '/address/'+$param.address+'/'+$param.pageSize+'/'+$param.pageNumber).then(response => {
        let msg = response.data
        
        let allPageNum = msg.Result.TxnTotal
        let finalPageNum = parseInt(allPageNum/10)+1
        let lastPageNum = 1
        if ($param.pageNumber>1){
          lastPageNum = $param.pageNumber-1
        }
        let nextPageNum = finalPageNum
        if ($param.pageNumber<finalPageNum){
          nextPageNum = $param.pageNumber-1+2
        }

        let info={
          info: getTransAmount($param.address, msg.Result),
          allPage: allPageNum,
          firstPage: {
            pageSize: '10',
            pageNumber: 1
          },
          lastPage:{
            pageSize: '10',
            pageNumber: lastPageNum
          },
          nextPage:{
            pageSize: '10',
            pageNumber: nextPageNum
          },
          finalPage: {
            pageSize: '10',
            pageNumber: finalPageNum
          }
        }
        commit({
          type: types.SET_ADDRESS_DETAIL_PAGE,
          info: info,
        })
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
