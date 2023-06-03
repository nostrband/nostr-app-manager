// https://www.svgrepo.com/svg/508323/user
const Avatar = (props) => {

  const size = props.size || 64;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <defs>
	<path id="user-a" d="M6,0 L10,0 C10,1.1045695 9.1045695,2 8,2 C6.8954305,2 6,1.1045695 6,0 Z M16,13.4537699 C13.3119196,14.48459 10.6263029,15 7.94314973,15 C5.2599966,15 2.61228002,14.48459 0,13.4537699 C0.534574606,9.15125664 3.18229118,7 7.94314973,7 C12.7040083,7 15.389625,9.15125664 16,13.4537699 Z"/>
	<path id="user-c" d="M9,10 C6.23857625,10 4,7.76142375 4,5 C4,2.23857625 6.23857625,0 9,0 C11.7614237,0 14,2.23857625 14,5 C14,7.76142375 11.7614237,10 9,10 Z M9,8 C10.6568542,8 12,6.65685425 12,5 C12,3.34314575 10.6568542,2 9,2 C7.34314575,2 6,3.34314575 6,5 C6,6.65685425 7.34314575,8 9,8 Z M1.99975067,20.0223292 C1.98741862,20.5744762 1.52981788,21.0120827 0.977670834,20.9997507 C0.425523784,20.9874186 -0.0120827307,20.5298179 0.000249326899,19.9776708 C0.145759691,13.46269 3.22368513,11 8.99994472,11 C15.0478478,11 18.1410179,13.4818866 17.9949389,20.0223292 C17.9826068,20.5744762 17.5250061,21.0120827 16.972859,20.9997507 C16.420712,20.9874186 15.9831055,20.5298179 15.9954375,19.9776708 C16.1173753,14.5181134 13.8803831,13 8.99994472,13 C4.37762816,13 2.12225712,14.53731 1.99975067,20.0223292 Z"/>
      </defs>
      <g fill="none" fillRule="evenodd" transform="translate(3 1)">
	<g transform="translate(1 5)">
	  <mask id="user-b" fill="#ffffff">
            <use xlinkHref="#user-a"/>
	  </mask>
	  <use fill="#D8D8D8" xlinkHref="#user-a"/>
	  <g fill="#FFA0A0" mask="url(#user-b)">
            <rect width="24" height="24" transform="translate(-4 -6)"/>
	  </g>
	</g>
	<mask id="user-d" fill="#ffffff">
	  <use xlinkHref="#user-c"/>
	</mask>
	<use fill="#000000" fillRule="nonzero" xlinkHref="#user-c"/>
	<g fill="#7600FF" mask="url(#user-d)">
	  <rect width="24" height="24" transform="translate(-3 -1)"/>
	</g>
      </g>
    </svg>
  )
}

export default Avatar;

