import { pending, fulfill, reject, MISSING_CUSTOMER } from '../../utils'
import { name, entity } from '../../reducers/customer/orders'
import { selectToken } from '../../selectors/customer'
import { checkAuth } from './account'
import { showNotification } from '../notifications'

// action creators

export const resetCustomerOrders = () => ({ type: `${name}/reset${entity}` })
export const resetCustomerOrdersError = () => ({
  type: `${name}/reset${entity}Error`,
})
export const setCustomerOrders = orders => ({
  type: `${name}/set${entity}`,
  payload: orders,
})

// async action creators

export const fetchCustomerOrders = limit => async (dispatch, getState) => {
  const { api } = getState().config
  if (!api) return
  const token = selectToken(getState())
  if (!token)
    return dispatch(reject(`${name}/fetch${entity}`, MISSING_CUSTOMER))
  dispatch(pending(`${name}/fetch${entity}`))
  try {
    const { data: orders } = await api.getCustomerOrders(token, limit)
    dispatch(fulfill(`${name}/fetch${entity}`, orders))
  } catch (err) {
    dispatch(checkAuth(err, () => reject(`${name}/fetch${entity}`, err)))
  }
}

export const deleteCustomerOrder = orderId => async (dispatch, getState) => {
  const { recurrenceApi } = getState().config
  if (!recurrenceApi) return
  const token = selectToken(getState())
  if (!token) {
    dispatch(showNotification('There was an issue removing order! User is not authorized'))
  }
  try {
    const response = await recurrenceApi.deleteOrder(orderId, token)
    if (!response.error) {
      dispatch(fetchCustomerOrders(null)) //TODO this is probably not a good pattern .. should follow
      dispatch(showNotification('Order has been successfully removed'))
    } else {
      dispatch(showNotification('There was an issue removing order! Order was not deleted.'))
    }
  } catch (err) {
    dispatch(showNotification('There was an issue removing order! Order was not deleted.'))
  }

}
