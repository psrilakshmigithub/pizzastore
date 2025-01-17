
// // export default Register;
// import React, { useState } from 'react';
// import axios from 'axios';
// import '../styles/Register.css';
// import { LoadScript, Autocomplete } from '@react-google-maps/api';

// const libraries = ['places']; // Required for Google Places Autocomplete

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     contacts: [{ phone: '', address: '', isDefault: true }],
//   });
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleContactChange = (index, field, value) => {
//     const updatedContacts = [...formData.contacts];
//     updatedContacts[index][field] = value;
//     setFormData({ ...formData, contacts: updatedContacts });
//   };

//   const addContact = () => {
//     setFormData({
//       ...formData,
//       contacts: [...formData.contacts, { phone: '', address: '', isDefault: false }],
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     // Validate all contact addresses for "Guelph"
//     const invalidAddresses = formData.contacts.some(
//       (contact) =>
//         contact.address && !contact.address.toLowerCase().includes('guelph')
//     );

//     if (invalidAddresses) {
//       setError('All delivery addresses must be in Guelph.');
//       return;
//     }

//     // Remove any `autocomplete` references before sending data
//     const sanitizedContacts = formData.contacts.map(({ autocomplete, ...rest }) => rest);
//     const sanitizedFormData = { ...formData, contacts: sanitizedContacts };

//     try {
//       await axios.post('http://localhost:5000/api/auth/register', sanitizedFormData);
//       alert('Registration Successful');
//       navigate('/managecontacts');
//     } catch (error) {
//       console.error('Error during registration:', error);
//       alert('Failed to register.');
//     }
//   };

//   const handlePlaceSelect = (index, autocomplete) => {
//     const place = autocomplete.getPlace();
//     if (place && place.formatted_address) {
//       handleContactChange(index, 'address', place.formatted_address);
//     }
//   };

//   return (
//     <LoadScript googleMapsApiKey="AIzaSyDry07Si3iUU8GZx99IGFh_UI1fOhlzmwg" libraries={libraries}>
//       <form className="register-form" onSubmit={handleSubmit}>
//         <h2>Register</h2>
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />

//         <h3>Contact Details</h3>
//         {formData.contacts.map((contact, index) => (
//           <div key={index} className="contact-section">
//             <input
//               type="text"
//               placeholder="Mobile"
//               value={contact.phone}
//               onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
//               required
//             />
//             <Autocomplete
//               onLoad={(autocomplete) => (contact.autocomplete = autocomplete)}
//               onPlaceChanged={() => handlePlaceSelect(index, contact.autocomplete)}
//             >
//               <input
//                 type="text"
//                 placeholder="Delivery Address (Optional)"
//                 value={contact.address}
//                 onChange={(e) => handleContactChange(index, 'address', e.target.value)}
//               />
//             </Autocomplete>
//             <label>
//               <input
//                 type="radio"
//                 name="isDefault"
//                 checked={contact.isDefault}
//                 onChange={() =>
//                   setFormData({
//                     ...formData,
//                     contacts: formData.contacts.map((c, i) => ({
//                       ...c,
//                       isDefault: i === index,
//                     })),
//                   })
//                 }
//               />
//               Default
//             </label>
//           </div>
//         ))}
//         <button type="button" onClick={addContact}>
//           Add Another Contact
//         </button>
//         {error && <p className="error-message">{error}</p>}
//         <button type="submit">Register</button>
//       </form>
//     </LoadScript>
//   );
// };

// export default Register;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contacts: [{ phone: '', address: '', isDefault: true }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts[index][field] = value;
    setFormData({ ...formData, contacts: updatedContacts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response =await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('user', JSON.stringify(response.data.user));
     
      alert('Registration Successful');
      navigate('/managecontacts');
    } catch (error) {
      console.error('Registration Error:', error.message);
      alert('Failed to register.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
      <h2>Register</h2>
      <form  className="register-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
    </div>
  );
};

export default Register;

