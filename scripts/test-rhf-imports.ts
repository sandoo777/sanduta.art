import {
  useForm,
  FormProvider,
  useFormContext,
  useWatch,
  Controller
} from "react-hook-form";

// Test that all imports work correctly
console.log('✅ Testing react-hook-form imports...\n');

console.log('useForm:', typeof useForm);
console.log('FormProvider:', typeof FormProvider);
console.log('useFormContext:', typeof useFormContext);
console.log('useWatch:', typeof useWatch);
console.log('Controller:', typeof Controller);

console.log('\n🎉 All react-hook-form imports are working correctly!');
