// SPDX-License-Identifier: MIT
pragma solidity ~0.8.0;

contract BinarySearch{

    function binarySear(uint[] memory arr, uint target) external pure returns(uint){
        if(arr.length == 0){
            return 0;
        }
        uint prev;
        uint next = arr.length - 1;
        uint middle = (prev + next) / 2;

        while (prev <= next){
            if(target == arr[middle]){
                return middle;
            }else if(target < arr[middle]){
                next = middle - 1;
            }else{
                prev = middle + 1;
            }
            middle =  (prev + next) / 2;
        }

        return arr.length;
    }
}