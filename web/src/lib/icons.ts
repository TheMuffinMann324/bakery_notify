import {
  faBan, faBolt, faBox, faBriefcase, faBroadcastTower, faBuilding, faBullhorn, faBurger, faCar, faCartShopping,
  faCheck, faCircleCheck, faCircleExclamation, faCircleInfo, faCircleQuestion, faClock, faCoins, faCreditCard,
  faCrosshairs, faFire, faFlag, faFlagCheckered, faGasPump, faGift, faGun, faHandcuffs, faHeart, faHelicopter,
  faHouse, faKey, faLocationDot, faLock, faMapLocationDot, faMoneyBill, faMoneyBillWave, faMotorcycle, faPersonRunning,
  faPhone, faPills, faPlane, faRoad, faShield, faShieldHalved, faSkull, faSpinner, faStar, faTaxi, faTrophy,
  faTriangleExclamation, faTruckMedical, faUnlock, faUpDownLeftRight, faUser, faUserShield, faUsers, faWrench, faXmark,
  faEnvelope, faNewspaper, faHospital, faBriefcaseMedical,
} from '@fortawesome/free-solid-svg-icons'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

// The icons that ship with the resource. Scripts can ask for any of these by name ('car', 'fa-solid fa-car',
// { 'fab', 'discord' }). Anything else falls back to the notification type's icon, so add names here to support them.
const LIST: IconDefinition[] = [
  faBan, faBolt, faBox, faBriefcase, faBroadcastTower, faBuilding, faBullhorn, faBurger, faCar, faCartShopping,
  faCheck, faCircleCheck, faCircleExclamation, faCircleInfo, faCircleQuestion, faClock, faCoins, faCreditCard,
  faCrosshairs, faFire, faFlag, faFlagCheckered, faGasPump, faGift, faGun, faHandcuffs, faHeart, faHelicopter,
  faHouse, faKey, faLocationDot, faLock, faMapLocationDot, faMoneyBill, faMoneyBillWave, faMotorcycle, faPersonRunning,
  faPhone, faPills, faPlane, faRoad, faShield, faShieldHalved, faSkull, faSpinner, faStar, faTaxi, faTrophy,
  faTriangleExclamation, faTruckMedical, faUnlock, faUpDownLeftRight, faUser, faUserShield, faUsers, faWrench, faXmark,
  faEnvelope, faNewspaper, faHospital, faBriefcaseMedical, faDiscord,
]

export const ICONS: Record<string, IconDefinition> = Object.fromEntries(LIST.map((d) => [d.iconName, d]))
