// SPDX-License-Identifier: MIT
pragma solidity ~0.8.0;

contract MergeSortArray{

    function mergeSortArr(uint[] memory arr1, uint[] memory arr2) external pure returns(uint[] memory){
        uint arr1Len = arr1.length;
        uint arr2Len = arr2.length;
        uint[] memory result = new uint[](arr1Len + arr2Len); 
        
        uint i = 0;
        uint j = 0;
        uint k = 0;
        
        while (i < arr1Len && j< arr2Len){
            if(arr1[i] < arr2[j]){
                result[k] = arr1[i];
                i++;
            }else{
                result[k] = arr2[j];
                j++;
            }
            k++;
        }

        while (i < arr1Len){
            result[k] = arr1[i];
            i++;
            k++;
        }

        while (j< arr2Len){
            result[k] = arr2[j];
            j++;
            k++;
        }
        return result;
    }
}