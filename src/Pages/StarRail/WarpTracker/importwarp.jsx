import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import StarRailSidebar from '../../components/StarRailSidebar';
import { starrailWishImportAPI } from '../../../APIs/wishImportAPI';

const ImportWish = ({ userID }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const generatedLink = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$(irm https://raw.githubusercontent.com/NousIndex/draw_import/main/starrail_link.ps1)} global"`;

  const handleCopyToClipboard = () => {
    /* Code to copy 'generatedLink' to the clipboard */
    const textArea = document.createElement('textarea');
    textArea.value = generatedLink;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setIsCopied(true);
  };

  async function runWishImportAPI(inputValue) {
    try {
      const loadingSwal = Swal.fire({
        title: '<b>Interfacing With API...</b>',
        icon: 'warning',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const response = await starrailWishImportAPI(inputValue, userID);
      let responseMessage = '';
      if (response === 'newData' || response === 'noNewData') {
        setButtonDisabled(true);
        // alert('Wish imported successfully!');
      } else if (response === 'authkey error') {
        responseMessage = 'Authkey Error!';
      } else {
        responseMessage = response;
      }

      loadingSwal.update({
        title:
          response === 'newData'
            ? '<b>New Data Updated!</b>'
            : response === 'noNewData'
            ? '<b>No New Data Found!</b>'
            : `<b>${responseMessage}</b>`,
        icon:
          response === 'newData'
            ? 'success'
            : response === 'noNewData'
            ? 'success'
            : 'error',

        showConfirmButton: true, // Show the confirm button now
      });
      loadingSwal.then((result) => {
        if (
          result.isConfirmed &&
          (response === 'newData' || response === 'noNewData')
        ) {
          navigate('/genshin/wish_tracker');
        }
      });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  const handleImportWish = () => {
    // Get the text from the input box
    const inputValue = document.querySelector(
      '.genshin-import-link-textbox-import'
    ).value;
    runWishImportAPI(inputValue);

    // You can now use the 'importedLink' state to work with the imported link
    // For example, you can send it to a server or perform any other actions.
  };

  return (
    <div className="genshin-import-container">
      <StarRailSidebar />
      <div className="import-wish-container">
        <h2 className="genshin-import-text-title">Steps to Import Warps:</h2>
        <ol className="genshin-import-instructions-container">
          <li className="genshin-import-text">
            Open Honkai: Star Rail on your PC.
          </li>
          <li className="genshin-import-text">
            Open the warp history in the game and wait for it to load.
          </li>
          <li className="genshin-import-text">
            Search and open up Windows Powershell.
          </li>
          <li className="genshin-import-text">
            Click Windows Powershell, then copy & paste the script below to the
            Powershell:
          </li>
          <input
            className="genshin-import-link-textbox"
            type="text"
            value={generatedLink}
            onClick={(e) => {
              e.target.select(); // Highlight the text when clicked
            }}
            readOnly
          />
          <button
            className="genshin-import-copy-button"
            onClick={handleCopyToClipboard}
          >
            {isCopied ? 'Copied!' : 'Copy Script'}
          </button>
          <li className="genshin-import-text">
            Press ENTER, and a link will be copied to your clipboard.
          </li>
          <li className="genshin-import-text">
            Paste the link to the input box below:
          </li>
          <input
            className="genshin-import-link-textbox-import"
            type="text"
          />
          <button
            className="genshin-import-copy-button"
            onClick={handleImportWish}
            disabled={isButtonDisabled}
          >
            {' '}
            Import Wish
          </button>
        </ol>
      </div>
    </div>
  );
};

export default ImportWish;
