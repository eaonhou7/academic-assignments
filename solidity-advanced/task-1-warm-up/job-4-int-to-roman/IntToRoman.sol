// SPDX-License-Identifier: MIT
pragma solidity ~0.8.0;

contract IntToRoman{
    function _string(uint x) private pure returns(string memory){
        if(x == 1) return 'I';
        if(x == 5) return 'V';
        if(x == 10) return 'X';
        if(x == 50) return 'L';
        if(x == 100) return 'C';
        if(x == 500) return 'D';
        if(x == 1000) return 'M';
        return 'F';
    }
    string public s;

    function intToRoman(uint x) public returns(string memory){
        s = "";
        uint current = 0;
        string memory tmpS;
        for(uint i = 1000; i>0; i = i / 10){
            current = x / i;
            if(current < 1) continue;
            if(current == 9){
                tmpS = concatStrings(_string(i), _string(i*10), "", "");
            }else if(current ==8){
                tmpS = concatStrings(_string(i*5),_string(i),_string(i),_string(i));
            }
            else if(current ==7){
                tmpS = concatStrings(_string(i*5),_string(i),_string(i), "");
            }
            else if(current ==6){
                tmpS = concatStrings(_string(i*5),_string(i), "", "");
            }
            else if(current ==5){
                tmpS = concatStrings(_string(i*5), "", "", "");
            }
            else if(current ==4){
                tmpS = concatStrings(_string(i), _string(i*5), "", "");
            }else if(current ==3){
                tmpS = concatStrings(_string(i), _string(i), _string(i), "");
            }
            else if(current ==2){
                tmpS = concatStrings(_string(i), _string(i), "", "");
            }
            else if(current ==1){
                tmpS = concatStrings(_string(i), "", "", "");
            }
            x -= i*current;
            s = concatStrings(s, tmpS, "", "");
        }
        return s;
    }

    function concatStrings(string memory s1, string memory s2,string memory s3,string memory s4) public pure returns (string memory) {
        return string(abi.encodePacked(s1, s2, s3, s4));
    }

}